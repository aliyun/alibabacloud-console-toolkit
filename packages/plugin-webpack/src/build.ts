import { PluginAPI } from '@alicloud/console-toolkit-core';
import { isFunction } from 'lodash'; 
import { debug, getEnv, exit } from '@alicloud/console-toolkit-shared-utils';
import { createCompiler, runCompiler, webpackConfigure } from './webpackUtils';
import { PluginAPIOpt } from './type';

export default async (api: PluginAPI, opts: PluginAPIOpt) => {
  const { webpack } = opts;

  let config = webpackConfigure(api, opts);

  if (isFunction(webpack)) {
    config = webpack(config, getEnv());
  }

  debug('engine', 'webpack config %s', config);

  const compiler = createCompiler(config);
  // const compiler = createCompiler(opts.config);

  const { onSuccess, onFail } = opts;

  try {
    const stats = await runCompiler(compiler, opts.watch);
    api.emit('onBuildSuccess', stats);
    if (onSuccess) {
      onSuccess(stats);
    }
  } catch (err) {
    api.emit('onBuildFail', err);
    if (onFail) {
      onFail(err);
    }
    if (getEnv().isCloudBuild()) {
      exit(1);
    }
  }
};
