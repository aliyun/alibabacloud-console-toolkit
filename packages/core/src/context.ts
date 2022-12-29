import { EventEmitter } from 'events';

import { require } from './utils/requireModule.js';
import resolvePlugins from './utils/resolvePlugins.js';
import { getEnv } from './utils/getEnv.js';
import type { IConfig, PluginOptions } from './types/config';
import type {
  IService,
  AsyncAPIMethod,
  IContext,
  SyncAPIMethod,
  PluginLifeCycleListener,
  CommandCallback,
  ICommandDef,
} from './types/service';

interface IOptions {
  cwd: string;
  config: IConfig;
  service: IService;
}

export default class Context implements IContext {
  #cwd: string;
  #config: IConfig;
  #service: IService;
  #asyncMethods = new Map();
  #syncMethods = new Map();
  #eventEmitter = new EventEmitter();

  constructor(options: IOptions) {
    const { cwd, config, service } = options;

    this.#cwd = cwd;
    this.#config = config;
    this.#service = service;
  }

  get env() {
    return getEnv();
  }

  get cwd() {
    return this.#cwd;
  }

  get config() {
    return this.#config;
  }

  get name() {
    return this.#service.name;
  }

  get version() {
    return this.#service.version;
  }

  get requireResolve() {
    return (path: string, paths: string[] = []) => {
      return require.resolve(path, { paths: [this.#cwd, ...paths] });
    };
  }

  get registerAPI() {
    return (name: string, fn: AsyncAPIMethod<any>) => {
      this.#asyncMethods.set(name, fn);
    };
  }

  get dispatchAPI() {
    return async (name: string, ...args: any[]) => {
      return this.#asyncMethods.get(name)(...args);
    };
  }

  get registerSyncAPI() {
    return (name: string, fn: SyncAPIMethod) => {
      this.#syncMethods.set(name, fn);
    };
  }

  get dispatchSyncAPI() {
    return (name: string, ...args: any[]) => {
      return this.#syncMethods.get(name)(...args);
    };
  }

  get on() {
    return (name: string, listener: PluginLifeCycleListener) => {
      return this.#eventEmitter.on(name, listener);
    };
  }

  get emit() {
    return (name: string, ...args: any[]) => {
      return this.#eventEmitter.emit(name, ...args);
    };
  }

  get registerPlugin() {
    return async (id: string, options: PluginOptions) => {
      const plugins = await resolvePlugins([[id, options]], this.#cwd);
      return this.#service.initPlugin(plugins[0], this);
    };
  }

  get registerCommand() {
    return (name: string, def: ICommandDef, callback: CommandCallback) => {
      return this.#service.registerCommand(name, def, callback);
    };
  }

  get getCommands() {
    return (commandNames?: string[]) => {
      if (!commandNames) return [];

      const commands = [];

      for (const command of this.#service.commands.entries()) {
        if (commandNames.includes(command[0])) commands.push(command[1]);
      }

      return commands;
    };
  }
}
