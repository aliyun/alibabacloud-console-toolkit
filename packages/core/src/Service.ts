import * as path from 'path';
import { EventEmitter } from 'events';
import { isArray } from 'lodash';
import { FullVersion as PackageJson } from 'package-json';
import { exit, error, resolveModule, matchesPluginId } from '@alicloud/console-toolkit-shared-utils';

import {
  BreezrPlugin,
  PluginAsyncMethodMap,
  Thenable,
  PluginConfig,
  PluginSyncMethodMap
} from './types/PluginAPI';
import { PluginAPI } from './PluginAPI';
import { isPlugin } from './utils/pluginResolver';
import { ServiceOption } from './types/ServiceOption';
import { resolvePresets } from './utils/presetResovler';
import { CommandMap, CommandArgs } from './types/Command';

enum PluginState {
  UNINIT,
  INITING,
  INITED
}

function idToPlugin(id: string) {
  if (isArray(id)) {
    id = id[0];
  }
  return {
    id: id.replace(/^.\//, 'built-in:'),
    pluginEntry: resolveModule(require(id))
  };
}

function resolvePluginsFromPkg(pkg: PackageJson) {
  return Object.keys(pkg.dependencies || {})
    .filter(isPlugin)
    .map(idToPlugin);
}

export class Service extends EventEmitter {
  public readonly cwd: string;
  public readonly pkg: PackageJson;
  public readonly plugins: BreezrPlugin[];
  public readonly commands: CommandMap;
  public readonly asyncMethods: PluginAsyncMethodMap;
  public readonly syncMethods: PluginSyncMethodMap;

  private _pluginStateMap: Map<string, PluginState>;
  private _serviceOptions: ServiceOption;

  public constructor(options: ServiceOption) {
    super();
    this.cwd = options.cwd;
    this._serviceOptions = options;

    try {
      this.pkg = require(path.join(this.cwd, 'package.json'));
    } catch (e) {
      console.warn(`no package.json found in cwd: ${this.cwd}`);
      this.pkg= {} as PackageJson;
    }

    this.commands = {};
    this.asyncMethods = {};
    this.syncMethods = {};

    this.plugins = this.resolveBuiltInPlugins(options.plugins);

    this._pluginStateMap = new Map();
  }

  /**
   *
   * @param name
   * @param args
   * @param rawArv
   */
  public async run(
    name: string,
    args: CommandArgs = {}
  ) {
    await this.init(args);

    let command = this.commands[name];

    if (!command && name) {
      error(`command "${name}" does not exist.`);
      exit(0);
    }

    if (!command || args.help || args.h) {
      command = this.commands.help;
    }
    const { fn } = command;
    await fn(args);
  }

  /**
   * get project config
   */
  public getConfig() {
    return this.invokeSync<PluginConfig>('getConfig');
  }

  public invoke<T>(apiName: string, ...args: any[]): Thenable<T> {
    return this.asyncMethods[apiName](...args);
  }

  public invokeSync<T>(apiName: string, ...args: any[]): T {
    return this.syncMethods[apiName](...args);
  }

  /**
   * init plugin
   */
  public async init(args: CommandArgs) {
    // init built-in plugins
    for (const plugin of this.plugins) {
      await this.initPlugin(plugin, args);
    }


    // init presets
    await this.resolvePresets(args);

    const config = this.getConfig();
    // init user define plugins
    for (const plugin of config.plugins) {
      let pluginId = plugin;
      if (isArray(plugin)) {
        [ pluginId ] = plugin;
      }
      // resolve local plugin
      if (pluginId.startsWith('.')) {
        pluginId = path.resolve(this.cwd, pluginId);
      }

      this.plugins.push(pluginId);
      await this.initPlugin(idToPlugin(pluginId), args);
    }
  }

  private async resolvePresets(args: CommandArgs) {
    const config = this.getConfig();
    const plugins = await resolvePresets(config, args);
    config.plugins = plugins;
  }

  private loadPluginOptions(id: string) {
    if (id.endsWith('plugins/config/config')) {
      return {
        config: this._serviceOptions.config
      };
    }
    const config = this.getConfig();
    const pluginConfig = config.plugins.find(c => {
      return isArray(c) && c[0] === id;
    });
    // plugin config is [ pluginId, config ]
    return pluginConfig ? pluginConfig[1] : null;
  }

  /**
   *
   * @param {BreezrPlugin} plugin
   */
  public async initPlugin(plugin: BreezrPlugin, args?: CommandArgs) {
    const { id, pluginEntry } = plugin;

    if (this._pluginStateMap.get(id) === PluginState.INITED) {
      return;
    }

    if (this._pluginStateMap.get(id) === PluginState.INITING) {
      error(`can't not circular refer in plugin: ${id}`);
      exit(0);
    }

    this._pluginStateMap.set(id, PluginState.INITING);

    // resolve dependencies
    try {
      const pkg = require(path.join(id, 'package.json'));
      const depsPlugins = resolvePluginsFromPkg(pkg);

      for (const dep of depsPlugins) {
        await this.initPlugin(dep, args);
      }
    } catch (e) {
      // throw e;
    }

    await pluginEntry(new PluginAPI(id, this), this.loadPluginOptions(id) || {}, args);

    this._pluginStateMap.set(id, PluginState.INITED);
  }

  /**
   * find all first class plugins for project
   * @returns {Array<BreezrPlugin>} - plugins
   */
  private resolveBuiltInPlugins(plugins?: any[]): BreezrPlugin[] {
    const builtInPlugins = [
      './plugins/config/config',
      './plugins/common/index',
      './plugins/commands/help'
    ].map(idToPlugin);

    if (!plugins) {
      plugins = [];
    }
    const resolvePlugins = plugins.map(idToPlugin);


    return [...builtInPlugins, ...resolvePlugins];
  }

  /**
   * Check if the project has a given plugin
   * @param {string} id - Plugin id, can omit the (@alicloud/console-toolkit-|breezr-|@scope/breezr)-plugin- prefix
   */
  public hasPlugin(id: string) {
    return this.plugins.some(p => matchesPluginId(id, p.id));
  }
}