import { PluginTarget } from 'babel__core';
import { isFunction, isPlainObject, merge } from 'lodash';
import { IOptions, IObject, BabelCreator } from './types';

type PluginEnabled = boolean | IObject | void;
type PluginEnabledGetter = (options: IOptions) => PluginEnabled;
type PluginOptions = IObject | void;
type PluginOptionsGetter = (options: IOptions) => PluginOptions;

type MergeWith = (options: IOptions) => any;

export const createPluginOptionsGetter = (
  mergeWith: MergeWith,
  defaultOptions?: IObject
): PluginOptionsGetter => (options: IOptions) => {
  const pluginOptions = mergeWith(options);

  if (isPlainObject(pluginOptions)) {
    return merge(
      {},
      isPlainObject(defaultOptions) ? defaultOptions : {},
      pluginOptions
    );
  }

  if (isPlainObject(defaultOptions)) {
    return defaultOptions;
  }
};

export default function createPluginCreator(
  target: PluginTarget,
  enable: boolean | PluginEnabledGetter = true,
  options?: IObject | PluginOptionsGetter
): BabelCreator {
  return (opt: IOptions) => {
    let didEnabled: PluginEnabled | PluginEnabledGetter = enable;

    if (isFunction(enable)) {
      didEnabled = enable(opt) as PluginEnabled;
    }

    if (!didEnabled) {
      return;
    }

    const plugin = [target];
    let pluginOptions: PluginOptions = options;

    if (isFunction(options)) {
      pluginOptions = options(opt);
    }

    if (isPlainObject(pluginOptions)) {
      plugin.push(pluginOptions as IObject);
    } else if (isPlainObject(didEnabled)) {
      plugin.push(didEnabled as IObject);
    }

    return plugin;
  };
}
