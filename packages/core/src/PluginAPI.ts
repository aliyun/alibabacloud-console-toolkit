/* eslint-disable no-dupe-class-members */
import * as path from 'path';
import * as assert from 'assert';

import { error } from '@alicloud/console-toolkit-shared-utils';

import { Service } from './Service';

import {
  SyncAPIMethod,
  PluginLifeCycelMethod,
  BreezrPlugin,
  Thenable,
  PluginConfig,
  AsyncAPIMethod
} from './types/PluginAPI';
import { CommandOption, CommandCallback } from './types/Command';

/**
 * Plugin API
 *
 * It provides the method for register method or lifecycle
 */
export class PluginAPI {
  public readonly service: Service;

  public readonly id: string;

  private _config?: PluginConfig;

  /**
   * @param id - Id of this plugin
   * @param service - A Breezr service instance
   */
  public constructor(id: string, service: Service) {
    this.id = id;
    this.service = service;
  }

  /**
   * config in config/config.js or in build.options.js
   */
  public get config() {
    if (!this._config) {
      this._config = this.service.getConfig();
    }
    return this._config;
  }

  /**
   * Get current working directory
   *
   * @returns {string} current working directory
   */
  public getCwd() {
    return this.service.cwd;
  }

  /**
   *
   * @param _path
   */
  public resolve(_path: string) {
    return path.resolve(this.service.cwd, _path);
  }

  /**
   * Check if the project has a given plugin
   * @param {string} id - Plugin id, can omit the (@alicloud/console-toolkit-|breezr-|@scope/breezr)-plugin- prefix
   */
  public hasPlugin(id: string) {
    return this.service.hasPlugin(id);
  }

  /**
   * Register a command in to breezr cli
   *
   * @param {string} name - name of command
   * @param {CommandOption} opts - options for the command
   * @param {CommandCallback} fn handle function for the command
   */
  public registerCommand(
    name: string,
    opts: CommandOption,
    fn: CommandCallback
  ) {
    this.service.commands[name] = {
      fn,
      option: opts || {}
    };
  }

  /**
   * Register a method in api that can be use by other plugin
   *
   * @param {string} name - methods name
   * @param {AsyncAPIMethod} fn - callback when methods been invoked
   * Register API for other Plugins
   */
  public registerAPI(name: string, fn: AsyncAPIMethod) {
    // TODO: check duplicate
    this.service.asyncMethods[name] = fn;
  }

  /**
   * Register a sync method in api that can be use by other plugin
   *
   * @param {string} name - methods name
   * @param {SyncAPIMethod} fn - callback when methods been invoked
   */
  public registerSyncAPI(name: string, fn: SyncAPIMethod) {
    if (this.service.syncMethods[name]) {
      error(`method ${name} is duplicate, it will be override`);
    }
    // TODO: check duplicate
    this.service.syncMethods[name] = fn;
  }

  /**
   * Register life cycle
   * @param lifecycleName -
   * @param fn -
   */
  public on(lifecycleName: string, fn: PluginLifeCycelMethod) {
    assert(
      lifecycleName.startsWith('on'),
      `Life Cycle method should starts with on`
    );
    this.service.on(lifecycleName, (...args) => {
      fn(...args);
    });
  }

  /**
   * emit life cycle
   *
   * @param lifecycleName -
   * @param args -
   */
  public emit(lifecycleName: string, ...args: any[]) {
    assert(
      lifecycleName.startsWith('on'),
      `Life Cycle method should starts with on`
    );
    return this.service.emit(lifecycleName, ...args);
  }

  /**
   *
   * @param {T extends string} action
   * @param {P} param
   *
   * @returns {Thenable<R>}
   */
  public dispatch<T extends string, P, R>(action: T, param: P): Thenable<R>;

  /**
   *
   * @param action
   * @param param1
   * @param param2
   */
  public dispatch<T extends string, P1, P2, R>(
    action: T,
    param1: P1,
    param2: P2
  ): Thenable<R>;

  public dispatch<P1, R>(action: string, param1: P1): Thenable<R>;

  public dispatch<R>(action: string): Thenable<R>;

  /**
   *
   * @param action
   * @param param
   */
  public async dispatch<R = any>(action: string, ...param: any[]) {
    const fn = this.service.asyncMethods[action];
    assert(!!fn, `no method register for name ${action}`);
    return await this.service.invoke<R>(action, ...param);
  }

  /**
   *
   * @param {T extends string} action
   * @param {P} param
   *
   * @returns {Thenable<R>}
   */
  public dispatchSync<T extends string, P, R>(action: T, param: P): R;

  /**
   *
   * @param action
   * @param param1
   * @param param2
   */
  public dispatchSync<T extends string, P1, P2, R>(
    action: T,
    param1: P1,
    param2: P2
  ): R;

  public dispatchSync<P1, R>(action: string, param1: P1): R;

  public dispatchSync<R>(action: string): R;

  /**
   *
   * @param action
   * @param param
   */
  public dispatchSync<R = any>(action: string, ...param: any[]) {
    const fn = this.service.syncMethods[action];
    assert(!!fn, `no method register for name ${action}`);
    return this.service.invokeSync<R>(action, ...param);
  }

  /**
   * Register a other plugins
   *
   * @param {string} name
   * @param {CommandOption} opts
   * @param {funtion} fn
   */
  public registerPlugin(plugin: BreezrPlugin) {
    this.service.initPlugin(plugin);
  }
}
