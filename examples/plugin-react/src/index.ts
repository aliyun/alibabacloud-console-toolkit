import { IContext, PluginOptions } from '@alicloud/console-toolkit-core';

import getProdConfig from './config/prod.js';
import getDevConfig from './config/common.js';
import build from './build.js';
import start from './server.js';

export default function (context: IContext, options: PluginOptions) {
  context.registerCommand('build', {
    description: 'build',
    usage: '',
  }, async () => {
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production';
    }

    context.emit('onBeforeBuild');

    const webpackConfig = getProdConfig(context, { mode: 'production', ...options });

    build(webpackConfig);

    context.emit('onAfterBuild');
  });

  context.registerCommand('start', {
    description: 'start',
    usage: '',
  }, async () => {
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'development';
    }

    context.emit('onBeforeDevServer');

    const webpackConfig = getDevConfig(context, { mode: 'development', ...options });

    const server = start(webpackConfig);

    server.startCallback(() => {
      context.emit('onAfterDevServer');
    });
  });
}