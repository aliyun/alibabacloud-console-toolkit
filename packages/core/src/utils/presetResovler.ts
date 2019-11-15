import { isArray } from 'lodash';
import { resolveModule, debug } from '@alicloud/console-toolkit-shared-utils';
import { PluginConfig } from '../types/PluginAPI';
import { CommandArgs } from '../types/Command';

function idToPreset(preset: string) {
  let presetId = preset;
  let presetConfig = null;
  if (isArray(preset)) {
    [presetId, presetConfig] = preset;
  }
  return {
    id: presetId.replace(/^.\//, 'built-in:'),
    presetEntry: resolveModule(require(presetId)),
    config: presetConfig || {},
  };
}

function mergePluginFromPreset(
  plugin: string,
  pluginMap: Map<string, any>,
  plugins: any[]
) {
  let pluginId = plugin;
  let pluginConfig = null;
  if (isArray(plugin)) {
    [pluginId, pluginConfig] = plugin;
  }
  if (pluginMap.has(pluginId)) {
    // merge plugin config
    if (pluginConfig) {
      Object.assign(pluginMap.get(pluginId), pluginConfig);
    }
  } else {
    plugins.push(plugin);
    pluginMap.set(pluginId, pluginConfig ? pluginConfig : {});
  }
}

export async function resolvePresets(config: PluginConfig, args: CommandArgs) {
  const { presets, plugins: orginalPlugin } = config;

  const pluginMap = new Map<string, any>();
  const plugins: any[] = [];

  await Promise.all(
    presets.map(idToPreset).map(async preset => {
      const { presetEntry, config } = preset;
      const presetConfig = await (presetEntry(config, args) as PluginConfig);
      presetConfig.plugins.forEach(plugin => {
        mergePluginFromPreset(plugin, pluginMap, plugins);
      });
    })
  );

  orginalPlugin.forEach(plugin => {
    mergePluginFromPreset(plugin, pluginMap, plugins);
  });

  debug('core', 'resolve plugin is %o', plugins);

  return plugins;
}