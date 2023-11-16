import * as crypto from 'crypto';
import * as Chain from 'webpack-chain';
import * as webpack from 'webpack';
import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';
import {
  Evnrioment,
  BuildType
} from '@alicloud/console-toolkit-shared-utils';
import normalize from './normalize';
import getHtmlFilename from './getHtmlFilename';
import setOptimization from './setOptimization';

export default (api: PluginAPI, options: PluginOptions) => {
  api.on('onChainWebpack', async (config: Chain, env: Evnrioment) => {
    const opts = { ...options };
    const { longTermCaching = false, version } = opts;

    // 如果是 ssr 构建关闭长效缓存的构建
    if (!longTermCaching || process.env.IS_SSR === 'true') {
      return;
    }

    const isProductionBuild = (env.buildType & BuildType.Prod) > 0;
    const isCloudBuild = env.buildType === BuildType.Prod_Cloud;

    let {
      // @ts-ignore
      preferHashedModuleId,
      // @ts-ignore
      preferHashedNamelessChunkId,
      // @ts-ignore
      cacheableHtmlFilename,
      // @ts-ignore
      outputFilename,
      // @ts-ignore
      outputChunkFilename,
      // @ts-ignore
      extractedCssFilename,
      // @ts-ignore
      extractedCssChunkFilename,
      // @ts-ignore
      vendors,
      // @ts-ignore
      commonChunk
    } = normalize(longTermCaching);

    // set output
    //
    // 在 dev 模式下使用 [hash], [contenthash] 或 [chunkhash]
    // 会造成一些难以排查的副作用和问题, 类如内存泄露
    // ref:
    // - https://github.com/webpack/webpack-dev-server/issues/377#issuecomment-241258405
    //
    config.output.filename(outputFilename).chunkFilename(outputChunkFilename);
    config.when(!isProductionBuild, config => {
      config.output.filename('[name].js').chunkFilename('[name].js');
    });

    setOptimization({ config, vendors, commonChunk });

    const miniCssExtractPlugin = config.plugin('extract-css');
    // 对原有的 MiniCssExtractPlugin 进行替换, 这个替换规则将优先于用户的原有配置
    // 以避免出现缓存冲突的情况出现, 当指定 experiment.longTermCaching 之后使用用户设定的配置或默认配置进行强制覆盖
    if (isProductionBuild && miniCssExtractPlugin) {
      // 只进行替换操作, 避免默认的 merge 操作将配置中的数组进行 concat 的行为
      miniCssExtractPlugin.tap(args => [
        Object.assign({}, ...args, {
          filename: extractedCssFilename,
          chunkFilename: extractedCssChunkFilename
        })
      ]);
    } else {
      config.plugins.delete('extract-css');
    }

    const htmlPlugin = config.plugin('HtmlPlugin');
    if (
      // 检查功能开关
      cacheableHtmlFilename &&
      // 只在构建模式开启
      // dev server 不开启 html 版本号来保证调试的便利性
      isProductionBuild &&
      // 只在云构建模式开启
      // 本地构建的结果有时候需要放到 server 容器中检查可用性, 不开启 html 版本号来保证调试的便利性
      isCloudBuild &&
      // 检查源配置中是否已经声明 HtmlWebpackPlugin, 如果没有声明则忽略 html 版本化
      htmlPlugin
    ) {
      const htmlFilename = getHtmlFilename(cacheableHtmlFilename, version);
      htmlPlugin.tap(args => [
        Object.assign({}, ...args, { filename: htmlFilename })
      ]);
    }

    //
    // 使用 4 位的 base64 hash 值代替模块 id
    // 避免由于关联模块的修改导致不应发生变化的模块 id 发生变化导致缓存失效
    // ref:
    // - https://webpack.js.org/plugins/hashed-module-ids-plugin/
    //
    if (
      preferHashedModuleId &&
      // 只在生产环境开启 hashed module id
      // dev-server 在 watch 模式下计算 hash 会导致内存堆栈溢出
      // https://github.com/webpack/webpack/issues/1914
      isProductionBuild &&
      webpack &&
      webpack.HashedModuleIdsPlugin
    ) {
      config.plugin('hashdModuleIds').use(webpack.HashedModuleIdsPlugin);
    }

    // 使用 4 位的 hash 值代替 chunk id
    // 避免由于新增 chunk 后, webpack 在重新计算 chunk id 后的变化导致缓存失效
    //
    // TODO(xingda.xd): 将该部分抽取为可复用的插件
    //
    if (
      preferHashedNamelessChunkId &&
      // 只在生产环境计算 hashed chunk id
      // dev-server 在 watch 模式下计算 hash 会导致内存堆栈溢出
      // https://github.com/webpack/webpack/issues/1914
      isProductionBuild &&
      webpack &&
      webpack.NamedChunksPlugin
    ) {
      const hashNamelessChunk = () => {
        // 记录已经生成的 hashed chunk id, 避免冲突
        const usedIds = new Set();
        return (chunk: any) => {
          if (chunk.name) {
            return chunk.name;
          }

          if (chunk.getModules) {
            const modules = chunk.getModules();
            const moduleIds = modules
              .map((m: any) => m.id)
              .sort()
              .join(';');
            const hash = crypto.createHash('sha256');
            hash.update(moduleIds);
            const hashId = hash.digest('hex');
            let hashIdLen = 4;
            let exactId;

            do {
              // 取出 hash 前 n 位, 和已经生成过的 chunk id 数据集进行比对
              // 如果出现了冲突, 则再取 hash 前 n + 1 位再次进行比对, 直到冲突解决为止
              exactId = hashId.substr(0, hashIdLen);
              hashIdLen += 1;
            } while (usedIds.has(exactId));

            usedIds.add(exactId);
            return exactId;
          }

          // 什么都没取到, 手动再见
          return null;
        };
      };
      config
        .plugin('hashdNamelessChunkId')
        .use(webpack.NamedChunksPlugin, [hashNamelessChunk()]);
    }
  });
};
