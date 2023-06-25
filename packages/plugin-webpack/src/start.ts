import { PluginAPI } from '@alicloud/console-toolkit-core';
import { isFunction } from 'lodash';
import * as webpackDevServer from 'webpack-dev-server';
import type { Middleware, Compiler } from 'webpack-dev-server';
import { getEnv } from '@alicloud/console-toolkit-shared-utils';
import { PluginAPIOpt } from './type';
import { webpackConfigure, createCompiler, runServer, createServer } from './webpackUtils';

export type getMiddleware = (compiler: Compiler) => Middleware

export default async (api: PluginAPI, opts: PluginAPIOpt, beforeServerMiddleWares: getMiddleware[], afterServerMiddleWares: getMiddleware[]) => {
  const { webpack } = opts;
  let config = webpackConfigure(api, opts);

  if (isFunction(webpack)) {
    config = webpack(config, getEnv());
  }
  
  const { devServer = {} } = config;

  const compiler = createCompiler(config);

  const { devServerOpt } = opts;

  const devServerConfig: webpackDevServer.Configuration = Object.assign({}, devServer, devServerOpt);

  // const originBefore = devServerConfig.before;
  // devServerConfig.before = (app, server, compiler) => {
  //   for (const middleware of serverMiddleWares) {
  //     app.use(middleware);
  //   }
  //   if (originBefore) {
  //     originBefore(app, server, compiler);
  //   }
  // };

  devServerConfig.setupMiddlewares = (middlewares, devServer) => {
    if (!devServer) {
      throw new Error('webpack-dev-server is not defined');
    }
    
    beforeServerMiddleWares.forEach(fn => {
      middlewares.unshift(fn(compiler));
    });

    afterServerMiddleWares.forEach(fn => {
      middlewares.unshift(fn(compiler));
    });

    return middlewares;
  }
  
  const server = createServer(compiler, devServerConfig);

  await runServer(server, devServerConfig);

  api.emit('onServerRunning');

  if (opts.onServerRunning) {
    opts.onServerRunning(server);
  }
};
