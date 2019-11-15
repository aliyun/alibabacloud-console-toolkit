import { PluginAPI, CommandArgs } from '@alicloud/console-toolkit-core';
import { debug, getEnv, error } from '@alicloud/console-toolkit-shared-utils';
import * as Chain from 'webpack-chain';
import { BuiltInConfig } from './BuiltInConfig';

const options = {
  description: 'build wind project',
  usage: 'build wind project'
};

/**
 *
 * @param api
 * @param opts
 */
async function buildByWebpack(api: PluginAPI, opts: CommandArgs) {
  const chain = new Chain();
  const env = getEnv();
  api.emit('onChainWebpack', chain, env);
  await api.dispatch('webpack', { config: chain.toConfig() });
}

async function buildByRollup(api: PluginAPI, opts: CommandArgs) {
  const rollupConfig = { ...opts };
  api.emit('onRollupConfig', rollupConfig);
  await api.dispatch('rollup', {
    config: rollupConfig
  });
  api.emit('onRollupBuildEnd');
}

async function buildByBabel(api: PluginAPI, opts: CommandArgs) {
  debug('builtIn', 'babel init %o', opts);
  const options = {
    cliOptions: {
      filenames: ["src"],
      outDir: "lib",
      verbose: true
    },
    babelOptions: {},
    ...opts,
  };
  await api.dispatch('babel', options);
  api.emit('onBabelBuildEnd');
  debug('builtIn', 'babel after dispatch %o', options);
}

const callback: (() => Promise<void>)[] = [];

/**
 * register builtIn start command for breezr
 * @param {PluginAPI} api breezr plugin api
 */
export default async function (api: PluginAPI, config: BuiltInConfig) {
  debug('plugin:builtin', 'register build command');

  api.registerSyncAPI('registerBeforeBuildStart', (fn: () => Promise<void>) => {
    callback.push(fn);
  });

  api.registerCommand('build', options, async (opts) => {

    for (const fn of callback) {
      await fn();
    }

    // await api.emit('onBuildStart');

    const buildEngineType = opts.engine || config.engine || 'webpack';
    let builder = null;
    switch(buildEngineType) {
      case 'webpack':
        builder = buildByWebpack;
        break;
      case 'babel':
        builder = buildByBabel;
        break;
      case 'rollup':
        builder = buildByRollup;
        break;
      default:
        error(`can't find build engine for ${buildEngineType}`);
        return;
    }
    await builder(api, opts);
    api.emit('onBuildEnd');
  });
}
