import { PluginAPI, CommandArgs } from '@alicloud/console-toolkit-core';
import { debug } from '@alicloud/console-toolkit-shared-utils';
import * as Chain from 'webpack-chain';
import * as Chain5 from '@gem-mine/webpack-chain';
import { getEnv, BuildType } from '@alicloud/console-toolkit-shared-utils';
// 这里只是取 webpack 的 types

import { BuiltInConfig } from './BuiltInConfig';

const options = {
  description: 'show webpack config of this env',
  usage: 'show webpack config of this env',
  options: {
    '--env': 'show webpack config according to env,'
  }
};

/**
 *
 * @param api
 * @param opts
 */
async function inspect(api: PluginAPI, opts: CommandArgs, webpack5?: boolean) {
  const chain = webpack5 ? new Chain5() : new Chain();
  const env = getEnv();
  switch(opts.env) {
    case 'development':
      env.buildType = BuildType.Dev;
      break;
    case 'production':
      env.buildType = BuildType.Prod;
      break;
    case 'cloud':
      env.buildType = BuildType.Prod_Cloud;
      break;
    default:
      env.buildType = BuildType.Dev;

  }
  await api.emit('onChainWebpack', chain, env);
  console.log(chain.toString());
}

/**
 * register builtIn start command for breezr
 * @param {PluginAPI} api breezr plugin api
 */
export default function (api: PluginAPI, config: BuiltInConfig) {
  debug('plugin:builtin', 'register inspect command');
  const { webpack5 } = config;

  api.registerCommand('inspect', options, async (opts) => {
    await inspect(api, opts, webpack5);
  });
}
