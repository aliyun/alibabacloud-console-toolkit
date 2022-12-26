import * as path from 'path';

import Context from './context';
import resolvePlugins from './utils/resolvePlugins';
import getUserConfig from './utils/loadConfig';
import resolvePresets from './utils/resolvePresets';
import {
  IPluginRegister,
  ICommandRegister,
  IContext,
  IServiceOption,
  IService,
  CommandCallback,
  ICommandDef,
  ICommandArgs,
} from './types/service';
import { IConfig } from './types/config';

enum PluginState {
  UNINIT,
  INITING,
  INITED
}

const CONFIG_FILES = [
  'config/config.js',
  'config/config.ts',
];

export class Service implements IService {
  readonly context: IContext;
  readonly #plugins: IPluginRegister[];
  readonly #pluginStateMap: Map<string, PluginState> = new Map();
  readonly #commands: Map<string, ICommandRegister> = new Map();

  constructor(options: IServiceOption) {
    const cwd = options.cwd || process.cwd();
    const config = getUserConfig([options.configFile, ...CONFIG_FILES]);

    this.context = new Context({
      cwd,
      config,
      service: this,
    });

    this.#plugins = this.#resolvePlugins(config, cwd);

    this.init();
  }

  get commands() {
    return this.#commands;
  }

  get registerCommand() {
    return (name: string, def: ICommandDef, callback: CommandCallback) => {
      this.#commands.set(name, { def, callback });
    };
  }

  /**
   *
   * @param name
   * @param args
   * @param rawArv
   */
  async run(name: string, args: ICommandArgs = {}) {
    let command = this.#commands.get(name);

    if (!command && name) {
      // error(`command "${name}" does not exist.`);
      process.exit(0);
    }

    if (!command || args.help || args.h) {
      command = this.#commands.get('help');
    }
    const { callback } = command;
    await callback(args);
  }

  /**
   * init
   */
  async init() {
    // init plugins
    for (const plugin of this.#plugins) {
      await this.initPlugin(plugin);
    }
  }

  /**
   * init Plugin
   */
  async initPlugin(plugin: IPluginRegister) {
    const { id, pluginEntry, opts } = plugin;

    if (this.#pluginStateMap.get(id) === PluginState.INITED) {
      return;
    }

    if (this.#pluginStateMap.get(id) === PluginState.INITING) {
      console.error(`can't not circular refer in plugin: ${id}`);
      process.exit(0);
    }

    this.#pluginStateMap.set(id, PluginState.INITING);

    await pluginEntry(this.context, opts);

    this.#pluginStateMap.set(id, PluginState.INITED);
  }

  #resolvePlugins(config: IConfig, cwd: string) {
    const builtInPlugins = [
      path.resolve(__dirname, './plugins/common/index'),
      path.resolve(__dirname, './plugins/commands/help'),
    ];

    const presetPlugins = resolvePresets(config, cwd);

    return resolvePlugins([...builtInPlugins, ...presetPlugins, ...config.plugins], cwd);
  }
}
