import { RollupOptions } from 'rollup';
import { PluginAPI } from "@alicloud/console-toolkit-core";
import compile from './compile';

export type RollupExtender = (config: RollupOptions | void) => RollupOptions;

export interface IRollupPluginOptions {
  config?: RollupOptions;
  rollup?: RollupExtender;
}

export default (api: PluginAPI, pluginConfig: IRollupPluginOptions) => {
  api.registerAPI('rollup', async (options: IRollupPluginOptions) => {
    const { config } = options;
    let { rollup } = pluginConfig;
    let rollupConfig = pluginConfig.config;
    
    if (options.rollup) {
      rollup = options.rollup;
    }

    if (typeof config !== 'undefined') {
      rollupConfig = {
        ...rollupConfig,
        ...config,
      };
    }

    if (typeof rollup === 'function') {
      rollupConfig = rollup(rollupConfig);
    }

    if (typeof rollupConfig !== 'undefined') {
      await compile(rollupConfig);
    }
  });
};
