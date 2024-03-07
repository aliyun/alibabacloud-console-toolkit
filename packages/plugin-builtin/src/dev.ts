import { PluginAPI } from '@alicloud/console-toolkit-core';
import { getConfigFile } from '@alicloud/console-toolkit-core/lib/plugins/config/config';
import * as Chain from 'webpack-chain';
import * as Chain5 from '@gem-mine/webpack-chain';
import { getEnv, watch } from '@alicloud/console-toolkit-shared-utils';

import { BuiltInConfig } from './BuiltInConfig';

async function server(api: PluginAPI, webpack5 = false, callback: (() => Promise<void>)[]) {
  const chain = webpack5 ? new Chain5() : new Chain();

  for (const fn of callback) {
    await fn();
  }

  api.emit('onDevStart');
  api.emit('onChainWebpack', chain, getEnv());
  await api.dispatch('webpackServer', { config: chain.toConfig(), mode: 'development' });
  api.emit('onDevEnd', chain);
}

export default function (api: PluginAPI, config: BuiltInConfig) {
  const { webpack5 } = config;
  const callback: (() => Promise<void>)[] = [];

  api.registerSyncAPI('registerBeforeDevStart', (fn: () => Promise<void>) => {
    callback.push(fn);
  });

  api.registerCommand('start', {
    description: 'start dev server',
    usage: 'start dev server'
  }, async () => {

    const absConfigPath = getConfigFile(api.getCwd());

    if (absConfigPath && !getEnv().isLocalBuild()) {
      watch('config', absConfigPath).on('change', () => {
        api.dispatchSync('restart');
      });
    }

    await server(api, webpack5, callback);
  });
}
