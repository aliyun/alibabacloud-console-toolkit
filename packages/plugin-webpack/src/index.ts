import * as express from 'express';
import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';

import build from './build';
import server from './start';

export default (api: PluginAPI, config: PluginOptions) => {
  const serverMiddleWare: express.RequestHandler[] = [];
  const afterServerMiddleWare: express.RequestHandler[] = [];

  api.registerSyncAPI('addMiddleware', (middleware: express.RequestHandler) => {
    serverMiddleWare.push(middleware);
  });

  api.registerSyncAPI('addAfterMiddleware', (middleware: express.RequestHandler) => {
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
  }, serverMiddleWare));

};
