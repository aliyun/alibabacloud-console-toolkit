import path from 'path';
import { IContext, PluginOptions } from '@alicloud/console-toolkit-core';

import build from './build.js';

export default function (context: IContext, options: PluginOptions) {
  context.registerCommand('init <projectName>', {
    description: 'init',
    usage: '',
  }, async (_options, args) => {
    const [projectName] = args || [];

    context.dispatchAPI('generate', {
      name: '@ali/xconsole-scaffold',
      dir: path.resolve(context.cwd, projectName),
      registry: 'http://registry.npm.alibaba-inc.com',
    });
  });

  context.registerCommand('build', {
    description: 'build',
    usage: '',
  }, async () => {
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production';
    }

    context.emit('onBeforeBuild');

    try {
      await build({
        ...options,
        cwd: context.cwd,
      });
    } catch (e) {
      console.error(e);
    }

    context.emit('onAfterBuild');
  });

  context.registerCommand('start', {
    description: 'start',
    usage: '',
  }, async () => {
  });
}