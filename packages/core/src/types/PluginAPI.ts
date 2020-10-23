/* eslint-disable @typescript-eslint/no-empty-interface */
export interface Thenable<T> extends PromiseLike<T> {}

import { PluginAPI } from "../PluginAPI";
import { CommandArgs } from "./Command";

export interface PluginOptions {
  [key: string]: any;
}

export interface PluginAsyncMethodMap {
  [key: string]: AsyncAPIMethod;
}

export interface PluginSyncMethodMap {
  [key: string]: SyncAPIMethod;
}


export interface PluginConfig {
  plugins: any[];
  presets: any[];
  [key: string]: any;
}

export type AsyncAPIMethod<T = any> = (...args: any) => Thenable<T>;

export type SyncAPIMethod<T = any> = (...args: any) => T;

export type PluginLifeCycelMethod<T = any> = (...args: any) => Thenable<T>;

export interface BreezrPlugin {
  id: string;

  opts?: {
    [key: string]: any;
  };

  pluginEntry: BreezrPluginFn;
}

export type BreezrPluginFn = (api: PluginAPI, opts?: PluginOptions, args?: CommandArgs) => void;
