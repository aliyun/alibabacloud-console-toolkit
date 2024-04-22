import { join, dirname } from 'path';
import { existsSync } from 'fs';

import { warn, debug, getEnv, babelRegister, resolveModule } from "@alicloud/console-toolkit-shared-utils";

import { PluginAPI } from "../../PluginAPI";
import { defaultConfig } from './options';
import { PluginConfig, PluginOptions } from '../../types/PluginAPI';
import { CommandArgs } from '../../types/Command';

const CONFIG_FILES = [
  'breezr.config.js',
  'config/config.js',
  'breezr.config.ts',
  'config/config.ts',
];

export const getConfigFile = (cwd: string) => {
  const files = CONFIG_FILES.map(file => join(cwd, file)).filter(file =>
    existsSync(file),
  );

  debug('core', 'find config file %j', files);

  if (files.length > 1) {
    warn(
      `Multiple config files ${files.join(', ')} detected, breezr will use ${
        files[0]
      }.`);
  }
  return files[0];
};

const requireFile = (filePath: string) => {
  if (!existsSync(filePath)) {
    debug('core', 'can\'t file filePath %s', filePath);
    return {};
  }

  const onError = (e: Error) => {
    console.error(e.stack);
    return {};
  };

  try {
    babelRegister([dirname(filePath)]);
    const config = require(filePath) || {};
    debug('core', 'require filePath %s %j', filePath, config);
    return resolveModule(config);
  } catch (e) {
    return onError(e as Error);
  }
};


export default (api: PluginAPI, opts: PluginOptions, args: CommandArgs) => {

  /**
   * register get config api 
   */
  let config: PluginConfig | null = null;
  const absConfigPath = args.config ? join(api.getCwd(), args.config) : getConfigFile(api.getCwd());

  api.registerSyncAPI('getConfig', () => {

    let devConfig = {};
    if (getEnv().isDev()) {
      try {
        devConfig = require(absConfigPath.replace(/\.js$/, `.local.js`));
      } catch(e) {
        //...
      }
    }

    // 如果用户自己传入了配置, 那么使用传入的配置.
    // TODO: 最好是可以合并配置
    if (opts.config) {
      config = opts.config;
    }
 
    if (config) {
      return config;
    }

    config = defaultConfig();
    if (absConfigPath) {
      config = Object.assign(
        {},
        config,
        requireFile(absConfigPath),
        devConfig,
      );
    }

    debug('core', 'finish process config, config is: %j', config);

    return config;
  });
};
