import path, { dirname } from 'path';
import { cac, CAC } from 'cac';
import { fileURLToPath } from 'url';

import Context from './context.js';
import resolvePlugins from './utils/resolvePlugins.js';
import getUserConfig from './utils/getConfig.js';
import resolvePresets from './utils/resolvePresets.js';
import type {
  IPluginRegister,
  ICommandRegister,
  IContext,
  IServiceOption,
  IService,
  CommandCallback,
  ICommandDef,
  ICommandArgs,
} from './types/service';
import type { IConfig } from './types/config';

enum PluginState {
  UNINIT,
  INITING,
  INITED
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_FILES = [
  'config/config.js',
  'config/config.ts',
];

export class Service implements IService {
  readonly name: string;
  readonly version: string;
  #plugins: IPluginRegister[] = [];
  #cli?: CAC;
  #pluginStateMap: Map<string, PluginState> = new Map();
  #commands: Map<string, ICommandRegister> = new Map();

  constructor(options: IServiceOption) {
    const { cli = true } = options || {};

    this.name = options.name;
    this.version = options.version;

    if (cli) {
      this.#cli = cac(options?.name);
      if (options.version) this.#cli.version(options.version);
      if (options.usage) this.#cli.usage(options.usage);
    }
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
   * call command action
   * @param name
   * @param args
   * @param rawArv
   */
  async run(name: string, options: ICommandArgs = {}) {
    let command = this.#commands.get(name);

    if (!command) {
      console.error(`command "${name}" does not exist.`);
      process.exit(0);
    }

    if (!command || options.help || options.h) {
      command = this.#commands.get('help');
    }

    const { callback } = command as ICommandRegister;
    await callback(options);
  }

  /**
   * start service
   */
  async start(options?: { cwd?: string; configFile?: string }) {
    const cwd = options?.cwd || process.cwd();

    //
    const config = await getUserConfig([
      options?.configFile, ...CONFIG_FILES.map((filePath) => path.resolve(cwd, filePath))
    ], cwd);

    //
    this.#plugins = await this.#resolvePlugins(config, cwd);

    // init context
    const context = new Context({
      cwd,
      config,
      service: this,
    });

    // init plugins
    for (const plugin of this.#plugins) {
      await this.initPlugin(plugin, context);
    }

    // init cli
    if (this.#cli) {
      for (const [commandName, { def }] of this.#commands) {
        const command = this.#cli.command(commandName, def.description, {
          allowUnknownOptions: true,
        });

        if (def.usage) command.usage(def.usage);
        if (def.options) {
          for (const option of Object.entries(def.options)) {
            const [optionName, optionExtra] = option;
            let description = optionExtra;
            let optionConfig = {};

            if (Array.isArray(optionExtra)) {
              description = optionExtra[0];
              optionConfig = optionExtra[1];
            }

            command.option(optionName, description as string, optionConfig);
          }
        }

        command.action((...args: any[]) => {
          const opts = args[args.length - 1];
          delete opts['--'];

          this.run(commandName, opts);
        });
      }
    }

    this.#cli?.help();

    this.#cli?.parse(process.argv);
  }

  /**
   * init Plugin
   */
  async initPlugin(plugin: IPluginRegister, context: IContext) {
    const { id, pluginEntry, opts = {} } = plugin;

    if (this.#pluginStateMap.get(id) === PluginState.INITED) {
      return;
    }

    if (this.#pluginStateMap.get(id) === PluginState.INITING) {
      console.error(`can't not circular refer in plugin: ${id}`);
      process.exit(0);
    }

    this.#pluginStateMap.set(id, PluginState.INITING);

    await pluginEntry(context, opts);

    this.#pluginStateMap.set(id, PluginState.INITED);
  }

  #resolvePlugins(config: IConfig, cwd: string) {
    const builtInPlugins = [
      path.resolve(__dirname, './builtin/common/index.js'),
    ];

    const presetPlugins = resolvePresets(config, cwd);

    return resolvePlugins([...builtInPlugins, ...presetPlugins, ...config.plugins], cwd);
  }
}