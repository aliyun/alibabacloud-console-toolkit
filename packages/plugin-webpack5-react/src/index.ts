import * as Chain from '@gem-mine/webpack-chain';
import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';
import { debug, Evnrioment, BuildType, getEnv, info, warn } from '@alicloud/console-toolkit-shared-utils';

import { chainDev } from './development';
import { chainProd } from './production';
import html from './html';

export * from './development';
export * from './production';

export default async function(api: PluginAPI, options: PluginOptions) {
  // 自动生成 https 证书
  if (options.https === true) {
    if (getEnv().isDev()) {
      info('HTTPS 已启用，生成自签名证书中……');
      try {
        const webpackMkcert = await import('webpack-mkcert');
        options.https = await webpackMkcert.default({
          hosts: ['localhost', '127.0.0.1'],
        });
        info('证书生成成功');
      } catch (e) {
        warn('证书生成失败');
        throw e;
      }
    }
  }

  api.on('onChainWebpack', async (config: Chain, env: Evnrioment) => {
    // plugin react chain start;
    api.emit('onReactChainStart', config, env);

    debug(
      'plugin:react',
      'onReactChainStart, env %s chain: %s',
      env,
      config.toString()
    );

    const opts = {
      ...options,
      cwd: api.getCwd(),
    };

    switch (env.buildType) {
      case BuildType.Dev:
      case BuildType.Dev_Local:
      case BuildType.Dev_Cloud:
        chainDev(config, opts, api);
        break;
      case BuildType.Prod:
      case BuildType.Prod_Local:
      case BuildType.Prod_Cloud:
        chainProd(config, opts, api);
        break;
      default:
    }

    // plugin react chain end;
    api.emit('onReactChainEnd', config, env);
  });

  html(api);
}
