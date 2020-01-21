import { join } from 'path';
import * as Chain from 'webpack-chain';

import { getEnv, BuildType } from '@alicloud/console-toolkit-shared-utils';

import { definePlugin } from './plugins/define';
import { uglifyPlugin } from './plugins/uglify';
import { common } from './common';
import { BreezrReactOptions } from '../types';
import { PluginAPI } from '@alicloud/console-toolkit-core';

export const prod = (config: Chain, options: BreezrReactOptions, api: PluginAPI) => {
  const {
    defineGlobalConstants
  } = options;

  const env = getEnv();

  //@ts-ignore
  config.mode(process.env.NODE_ENV || 'production');

  // set common config
  common(config, {
    ...options,
    noProgress: options.noProgress || env.isCloudBuild()
  }, api);

  if (env.isCloudBuild() && env.buildDestDir) {
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

};
