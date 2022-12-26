import path from 'path';

import requireModule from './requireModule';
import { PluginConfig } from '../types/config';
import { IPluginRegister } from '../types/service';

const resolvePlugins = (pluginList: PluginConfig[], cwd: string) => {
  const plugins: IPluginRegister[] = [];
  const pluginMap = new Map();

  for (const plugin of pluginList) {
    let pluginId: string = plugin as string;
    let options = null;

    if (Array.isArray(plugin)) {
      [pluginId, options] = plugin;
    }

    if (pluginMap.has(pluginId)) {
      if (options) {
        pluginMap.set(pluginId, options);
        // TODO: 处理冲突的配置
      }

      continue;
    }

    if (typeof pluginId !== 'string') {
      // TODO: warn
      continue;
    }

    // resolve local plugin
    if (pluginId.startsWith('.')) {
      pluginId = path.resolve(cwd, pluginId);
    }

    pluginMap.set(pluginId, options);
    plugins.push({
      id: pluginId,
      opts: options || {},
      pluginEntry: requireModule(pluginId),
    });
  }

  return plugins;
};

export default resolvePlugins;
