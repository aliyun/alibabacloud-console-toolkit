import * as Chain from 'webpack-chain';
import { PluginOptions, PluginAPI } from '@alicloud/console-toolkit-core';
import { dev } from './webpack/dev';

export const chainDev = (config: Chain, options: PluginOptions, api: PluginAPI) => {
  dev(config, options, api);
};
