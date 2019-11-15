import { join, resolve } from "path";
import { sortedUniq } from "lodash";
import * as webpack from 'webpack';
import * as Chain from "webpack-chain";
import { PluginAPI } from "@alicloud/console-toolkit-core";
import { getEnv, error, info, exit, debug } from "@alicloud/console-toolkit-shared-utils";

import { IOption } from "./type";
import { VENDER } from "./constants";
import { getDeps, writeDeps, Deps } from "./utils";


const buildDll = async (api: PluginAPI, dllOutputDir: string, deps: Deps) => {
  const config = new Chain();
  await api.emit('onChainWebpack', config, getEnv());

  config.entryPoints.delete('index');
  config.entryPoints.delete('vendor');
  config.entryPoints.delete('runtime');

  deps.deps.forEach((lib) => {
    config.entry('breezr').add(lib);
  });

  config.output.filename(deps.dllName);
  config.output.path(dllOutputDir);
  config.output.library('[name]');
  config.output.delete('chunkFilename');

  config.plugin('DllPlugin').use(webpack.DllPlugin, [{
    path: join(config.output.get('path'), '[name].json'),
    name: '[name]',
    context: config.get('context'),
  }]);

  config.optimization.delete('splitChunks');
  config.optimization.delete('runtimeChunk');
  config.plugins.delete('HtmlPlugin');
  config.plugins.delete('GetherResource');
  config.plugins.delete('Skeleton');

  debug('dll', config.toConfig());

  await api.dispatch('webpack', {
    config: config.toConfig(),
    /* 强制复写用户的 自定义 webpack */
    webpack: () => config.toConfig()
  });
};

export default async (api: PluginAPI, option: IOption) => {
  const { dllLib, dllOutputDir = resolve(api.getCwd(), 'dll') } = option;

  const depNames = sortedUniq([
    ...VENDER,
    ...dllLib ? dllLib : [],
  ]);

  let deps = getDeps(dllOutputDir);

  if (deps) {
    const cachedFiles = deps.deps;
    if (cachedFiles && cachedFiles.join(', ') === depNames.join(', ')) {
      return;
    }
  } else {
    deps = {
      dllName: '',
      deps: depNames
    };
  }

  deps.dllName = option.dllName ? `${option.dllName}.js` : `breezr.${Date.now()}.dll.js`;

  // dll only build in NODE_ENV=production
  // tmp set env to prod mode
  // and it will restore env after build dll
  const cachedEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  try {
    info('building dll');

    await buildDll(api, dllOutputDir, deps);
    writeDeps(dllOutputDir, {
      ...deps,
      deps: depNames
    });

    info('dll build successfully!');
  } catch(e) {
    error(e.toString());
    debug('dll', e.stack);
    exit(0);
  }

  process.env.NODE_ENV = cachedEnv;
};

