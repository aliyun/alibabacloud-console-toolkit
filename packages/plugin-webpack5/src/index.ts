import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';

import build from './build';
import server from './start';
import type { getMiddleware } from './start';

export default (api: PluginAPI, config: PluginOptions) => {
  const serverMiddleWare: getMiddleware[] = [];
  const afterServerMiddleWare: getMiddleware[] = [];

  api.registerSyncAPI('addMiddleware', (middleware: getMiddleware) => {
    serverMiddleWare.push(middleware);
  });

  api.registerSyncAPI('addAfterMiddleware', (middleware: getMiddleware) => {
    afterServerMiddleWare.push(middleware);
  });

  api.registerAPI('webpack', async opts => await build(api, {
    webpack: config.webpack,
    watch: config.watch,
    disableHmr: config.disableHmr,
    ...opts
  }));

  api.registerAPI('webpackServer', async opts => await server(api, {
    webpack: config.webpack,
    ...opts
  }, serverMiddleWare, afterServerMiddleWare));
};
