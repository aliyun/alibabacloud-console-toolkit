import { IConfig, PluginOptions, PresetOptions, PluginConfig } from './config';
import { IEnvironment } from './env';

export type PluginReturn = any;

export interface IPresetReturn {
  plugins: PluginConfig[];
}

export type PluginFn = (context: IContext, options: PluginOptions) => PluginReturn;

export type PresetFn = (options: PresetOptions) => IPresetReturn | undefined;

export interface IPluginRegister {
  /**
   * plugin id
   */
  id: string;

  /**
   * plugin options
   */
  opts?: {
    [key: string]: any;
  };

  /**
   * plugin callback
   */
  pluginEntry: PluginFn;
}

export interface IServiceOption {
  /**
   * project root dir path
   */
  cwd: string;
  // config?: IConfig;
  /**
   * config file path
   */
  configFile?: string;
  /**
   * if use inner cli, default true;
   */
  cli?: boolean;
  /**
   * cli name
   */
  name: string;
  /**
   * cli version
   */
  version: string;
  /**
   * cli usage
   */
  usage?: string;
}

export interface ICommandArgs {
  [key: string]: any;
}

export type CommandCallback = (args: ICommandArgs, rawArgs?: string[]) => PromiseLike<any>;

interface ICommandOptionConfig {
  default?: string;
}

export interface ICommandDef {
  /**
   * description of the command
   */
  description: string;

  /**
   * indicate the usage of this commands like `Usage: cmd1 [options] <fileName>`
   */
  usage: string;

  /**
   * more detail of the
   */
  details?: string;

  /**
   * options for commands like: { '-x, --xxxx': [description, config] }
   */
  options?: {
    [key: string]: string | [string, ICommandOptionConfig];
  };
}

export type CommandKey = string;

export interface ICommandRegister {
  callback: CommandCallback;
  def: ICommandDef;
}

export type AsyncAPIMethod<T = any> = (...args: any) => PromiseLike<T>;

export type SyncAPIMethod<T = any> = (...args: any) => T;

export type PluginLifeCycleListener<T = any> = (...args: any) => PromiseLike<T>;

export interface IContext {
  readonly cwd: string;
  readonly config: IConfig & { [key: string]: any };
  readonly env: IEnvironment;
  readonly name: string;
  readonly version: string;
  readonly requireResolve: (request: string, paths?: string[]) => string;
  readonly registerAPI: (name: string, callback: AsyncAPIMethod) => void;
  readonly dispatchAPI: <R = any>(name: string, ...args: any[]) => PromiseLike<R>;
  readonly registerSyncAPI: (name: string, callback: SyncAPIMethod) => void;
  readonly dispatchSyncAPI: <R = any>(name: string, ...args: any[]) => R;
  readonly on: (name: string, listener: PluginLifeCycleListener) => void;
  readonly emit: (name: string, ...args: any[]) => void;
  readonly registerPlugin: (id: string, opts: PluginOptions) => void;
  readonly registerCommand: (name: string, def: ICommandDef, callback: CommandCallback) => void;
  readonly getCommands: (commandNames?: string[]) => Array<[string, ICommandRegister]>;
}

export interface IService {
  readonly commands: Map<string, ICommandRegister>;
  /**
   * cli name
   */
  readonly name: string;
  /**
   * cli version
   */
  readonly version: string;
  readonly run: (commandName: string, commandArgs: ICommandArgs) => void;
  readonly initPlugin: (plugin: IPluginRegister, context: IContext) => void;
  readonly registerCommand: (name: string, def: ICommandDef, callback: CommandCallback) => void;
}
