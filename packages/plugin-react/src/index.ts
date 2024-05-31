import * as Chain from 'webpack-chain';
import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';
import {
  debug,
  Evnrioment,
  BuildType,
  getEnv,
} from '@alicloud/console-toolkit-shared-utils';
import { mkcert2webpack } from '@alicloud/mkcert-bin';

import { chainDev } from './development';
import { chainProd } from './production';
import html from './html';

export * from './development';
export * from './production';

export default async function (api: PluginAPI, options: PluginOptions) {
  if (getEnv().isDev()) {
    // 本地开发环境，注册 https 证书
    options.https = await mkcert2webpack(options.https);
    options.reactRefresh = options.reactRefresh ?? true;
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
