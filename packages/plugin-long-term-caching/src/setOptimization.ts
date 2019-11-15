import { isEmpty, isNil, omitBy } from 'lodash';
import * as Chain from 'webpack-chain';

interface Options {
  config: Chain;
  vendors: string[];
  commonChunk: any;
}

export default function(options: Options) {
  const { vendors, config, commonChunk } = options;
  let vendorCacheGroup;
  if (vendors && !isEmpty(vendors)) {
    const slashToUnderlineVendors = vendors.map((v: string) =>
      v.replace('/', '_')
    );
    vendorCacheGroup = {
      // - npm/yarn: /node_modules/lodash
      //
      test: new RegExp(
        `[\\\\/]node_modules[\\\\/]_?(${slashToUnderlineVendors.join(
          '|'
        )})[\\\\/@]`
      ),
      name: 'vendor',
      chunks: 'all',
      // 优先处理 vendor chunks
      priority: 100
    };
  }

  let commonCacheGroup;
  if (commonChunk) {
    commonCacheGroup = commonChunk;
  }

  // webpack 4 中, 移除了 CommonsChunkPlugin 并增加了新的选项配置来指定更加方便和更加细粒度的代码分割策略:
  // - optimization.runtimeChunk
  // - optimization.splitChunks
  // refs:
  // - https://webpack.js.org/configuration/optimization/
  // - https://webpack.js.org/plugins/split-chunks-plugin/
  // - https://gist.github.com/sokra/1522d586b8e5c0f5072d7565c2bee693
  //
  config.optimization
    // 将所有的 runtime 合并为一个 chunk
    // 尽可能减少冗余的网络请求并提高 runtime 的复用率并避免 chunk 内容中的 ref 变更导致缓存失效
    // 如果项目中的 chunks 过少, 开启配置会略微降低应用的性能, 可以考虑设置为 false, 但是并没有太大的必要
    .runtimeChunk('single')

    .splitChunks({
      cacheGroups: omitBy(
        {
          // 提取公共依赖模块
          common: commonCacheGroup,
          // 针对 vendors 进行分割以启用长效缓存策略
          // 所有指定的 vendors 将会构建为一个单独的 chunk, 而不是通过动态分割的方式自动提取
          // 这样做的目的是为了增强第三方 library 的生存周期, 减少不必要的缓存更新
          // 开启 vendors 之后唯一的副作用在于整体的构建结果的体积变大 (约10%)
          // 会略微影响初次加载的性能, 但是在 gzip 之后这些性能损耗几乎可以忽略不计
          // 而且在长效缓存的策略下, 应用整体性能得到的提升将远远覆盖性能损耗的副作用
          vendor: vendorCacheGroup
        },
        isNil
      )
    });
}
