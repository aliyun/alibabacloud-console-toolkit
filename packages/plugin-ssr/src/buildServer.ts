import * as path from 'path';
import * as fs from 'fs';
import * as webpack from 'webpack';
import * as Chain from "webpack-chain";
import { PluginAPI } from "@alicloud/console-toolkit-core";

import { getEnv, error, info, exit, debug, done } from "@alicloud/console-toolkit-shared-utils";

import { IOption } from './types'


const writeMockWindow = (outputPath: string) => {
  const serverEntryPath = path.resolve(outputPath, 'index.js');
  const content = fs.readFileSync(serverEntryPath, { encoding: 'UTF-8'} );
  fs.writeFileSync(serverEntryPath, `
var window = {}; var navigator = {};
var location = window.location = {
  search: '',
  hostname: 'foo.bar.com'
};\n${content}`);
}

export default async (api: PluginAPI, opts: IOption) => {
  try {
    info('building ssr bundle');
    const outputPath = await buildServer(api, opts);

    if (getEnv().isDev()) {
      writeMockWindow(outputPath);
    }

    done('ssr bundle build successfully!');
  } catch(e) {
    error((e as Error).toString());
    debug('ssr', (e as Error).stack);
    exit(0);
  }
};

const buildServer = async (api: PluginAPI, opts: IOption) => {
  const { entry = './index.server' } = opts;

  const cachedEnv = process.env.NODE_ENV;
  process.env.IS_SSR = 'true';
  process.env.NODE_ENV = 'production';

  const config = new Chain();
  await api.emit('onChainWebpack', config, getEnv());

  // remove browser config
  config.entryPoints.delete('index');
  config.entryPoints.delete('vendor');
  config.entryPoints.delete('runtime');
  config.output.delete('chunkFilename');
  config.optimization.delete('splitChunks');
  config.optimization.delete('runtimeChunk');
  config.plugins.delete('GetherResource');
  config.plugins.delete('Skeleton');
  config.plugins.delete('webpackBar');
  config.plugins.delete('McmsAssetsPlugins');
  config.plugins.delete('BundleAnalyzerPlugin');

  // server config

  // config entry
  config.entry('index').add(entry);

  // config output
  config.output.path(path.join(config.output.get('path'), 'server'));
  config.output.libraryTarget('commonjs2');

  config.target('node');

  config.plugin('SSRDefinePlugin').use(webpack.DefinePlugin, [{
    'process.env.IS_SSR':JSON.stringify(true),
  }]);

  config.externals({
    'react-dom': 'react-dom',
  });

  debug('ssr', config.toConfig());

  await api.dispatch('webpack', {
    config: config.toConfig(),
    /* 强制复写用户的 自定义 webpack */
    webpack: (conf: any, ...args: any[]) => {
      if (opts.webpack) {
        return opts.webpack(config.toConfig(), ...args)
      }
      return config.toConfig()
    }
  });

  process.env.IS_SSR = undefined;
  process.env.NODE_ENV = cachedEnv;

  return config.output.get('path');
};
