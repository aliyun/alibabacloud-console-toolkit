import * as Chain from '@gem-mine/webpack-chain';
import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';
import {
  debug,
  Evnrioment,
  BuildType,
} from '@alicloud/console-toolkit-shared-utils';

import { chainDev } from './development';
import { chainProd } from './production';
import html from './html';
import mkcert from './mkcert';

export * from './development';
export * from './production';

export default async function (api: PluginAPI, options: PluginOptions) {
  await mkcert(api, options);

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
