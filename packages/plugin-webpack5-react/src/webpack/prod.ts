import { join } from 'path';
import * as Chain from '@gem-mine/webpack-chain';
import { existsSync } from 'fs-extra';
import { getEnv, BuildType } from '@alicloud/console-toolkit-shared-utils';

import { definePlugin } from './plugins/define';
import { uglifyPlugin } from './plugins/uglify';
import { common } from './common';
import { BreezrReactOptions } from '../types';
import { PluginAPI } from '@alicloud/console-toolkit-core';

export const prod = (config: Chain, options: BreezrReactOptions, api: PluginAPI) => {
  const {
    defineGlobalConstants,
    enableCache,
    cacheDirectory
  } = options;
  const rootDir = process.cwd();
  const env = getEnv();

  if (!!options.sourceMap) {
    config.devtool('source-map');
  }

  // @ts-ignore
  config.mode(process.env.NODE_ENV || 'production');

  // set common config
  common(config, {
    ...options,
    noProgress: options.noProgress || env.isCloudBuild()
  }, api);

  if ((env.buildType === BuildType.Dev_Cloud || env.buildType === BuildType.Prod_Cloud )
      && env.buildDestDir) {
    config.output.path(join(process.cwd(), env.buildDestDir));
  }

  definePlugin(config, {
    'process.env.NODE_ENV': JSON.stringify('production'),
    ...defineGlobalConstants
  });

  /**
   * TODO: dynamicBundle, bundleAnalyzer
   */

  uglifyPlugin(config, options);

  config
    .optimization
    .minimize(!options.disableUglify);
  
  if (enableCache) {
    const buildDependencies = [join(rootDir, 'package.json')];

    if (existsSync(join(rootDir, 'config/config.js'))) {
      buildDependencies.push(join(rootDir, 'config/config.js'));
    } else if (existsSync(join(rootDir, 'config/config.ts'))) {
      buildDependencies.push(join(rootDir, 'config/config.ts'));
    }

    config.cache({
      type: 'filesystem',
      compression: 'gzip',
      buildDependencies: {
        config: buildDependencies
      },
      cacheDirectory: cacheDirectory ? join(cacheDirectory, 'webpack') : join(rootDir, 'node_modules/.cache', 'webpack'),
    });

    config.snapshot({
      // tnpm install 生成的 link 在创建 snapshot 时会导致依赖死循环，从而导致 OOM
      // tnpm 包目录格式: node_modules/_react@16.14.0@react
      immutablePaths: [/^(.+?[\\/]node_modules[\\/]_.+?@.+?@.+?)[\\/]/],
    })
  }
};
