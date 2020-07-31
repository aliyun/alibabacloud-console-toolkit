import * as Chain from 'webpack-chain';
import * as webpack from 'webpack';
import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';
import { BuildType, Evnrioment } from '@alicloud/console-toolkit-shared-utils';
import { generateCdnPath } from './generateCdnPath';

export default (api: PluginAPI, options: PluginOptions) => {
  api.on('onChainWebpack', async (config: Chain, env: Evnrioment) => {
    const {
      buildType,
    } = env;

    const cdnPath = generateCdnPath({
      ...env,
      publishType: options.publishType
    });

    const { outputPublicPath } = options;

    if (
      // 用户如果已经指定了 public path , 不做任何替换避免出现不符合期望的情况
      !outputPublicPath &&
      // 只有 cdn path 在有效的情况下进行替换
      cdnPath &&
      // 只有在云构建生产环境代码时将 publicPath 替换为当前项目的 CDN 地址
      buildType === BuildType.Prod_Cloud
    ) {
      // add the cdn path
      config.plugin('CDNDefinePlugin').use(
        webpack.DefinePlugin, 
        [{
          'process.env.PROJECT_PUBLIC_PATH': JSON.stringify(cdnPath)
        }]
      );
      api.dispatchSync('addHtmlPrescript', `<meta data-type="oneconsole.webpack_public_config" data-publicPath="${cdnPath}">`);

      return config.output.publicPath(cdnPath);
    }
  });
};
