import * as Chain from '@gem-mine/webpack-chain';
import { prod } from './webpack/prod';
import { PluginOptions, PluginAPI } from '@alicloud/console-toolkit-core';

export const chainProd = (config: Chain, options: PluginOptions, api: PluginAPI) => {
  prod(config, options, api);
};
