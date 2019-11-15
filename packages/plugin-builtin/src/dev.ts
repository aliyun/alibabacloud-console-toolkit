import { PluginAPI, CommandArgs } from '@alicloud/console-toolkit-core';
import { getConfigFile } from '@alicloud/console-toolkit-core/lib/plugins/config/config';
import * as Chain from 'webpack-chain';
import { getEnv, watch } from '@alicloud/console-toolkit-shared-utils';

const callback: (() => Promise<void>)[] = [];

async function server(api: PluginAPI, opts: CommandArgs) {
  const chain = new Chain();

  for (const fn of callback) {
    await fn();
  }

  api.emit('onDevStart');
  api.emit('onChainWebpack', chain, getEnv());
  await api.dispatch('webpackServer', { config: chain.toConfig(), mode: 'development' });
  api.emit('onDevEnd', chain);
}

export default function (api: PluginAPI) {

  api.registerSyncAPI('registerBeforeDevStart', (fn: () => Promise<void>) => {
    callback.push(fn);
  });

  api.registerCommand('start', {
    description: 'start dev server',
    usage: 'start dev server'
  }, async (opts) => {

    const absConfigPath = getConfigFile(api.getCwd());

    if (absConfigPath && !getEnv().isLocalBuild()) {
      watch('config', absConfigPath).on('change', () => {
        api.dispatchSync('restart');
      });
    }

    await server(api, opts);
  });
}
