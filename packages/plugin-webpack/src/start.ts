import { PluginAPI } from '@alicloud/console-toolkit-core';
import { isFunction } from 'lodash';
import * as express from 'express';
import * as webpackDevServer from 'webpack-dev-server';
import { getEnv } from '@alicloud/console-toolkit-shared-utils';
import { PluginAPIOpt } from './type';
import { webpackConfigure, createCompiler, runServer, createServer, } from './webpackUtils';

export default async (api: PluginAPI, opts: PluginAPIOpt, serverMiddleWares: express.RequestHandler[]) => {
  const { webpack, disableHmr } = opts;
  let config = webpackConfigure(api, opts);

  if (isFunction(webpack)) {
    config = webpack(config, getEnv());
  }
  const { devServer = {} } = config;
  if (!disableHmr) {
    webpackDevServer.addDevServerEntrypoints(config, devServer);
  }
  const compiler = createCompiler(config);

  const { devServerOpt } = opts;

  const devServerConfig: webpackDevServer.Configuration = Object.assign({}, devServer, devServerOpt);

  const originBefore = devServerConfig.before;
  devServerConfig.before = (app, server, compiler) => {
    for (const middleware of serverMiddleWares) {
      app.use(middleware);
    }
    if (originBefore) {
      originBefore(app, server, compiler);
    }
  };

  const server = createServer(compiler, devServerConfig);
  await runServer(server, devServerConfig);
  api.emit('onServerRunning');
  if (opts.onServerRunning) {
    opts.onServerRunning(server);
  }
};
