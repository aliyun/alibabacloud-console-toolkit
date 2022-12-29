import path from 'path';

import requireModule from './requireModule.js';
import type { PluginConfig } from '../types/config';
import type { IPluginRegister } from '../types/service';

const resolvePlugins = async (pluginList: PluginConfig[], cwd: string) => {
  // const plugins: IPluginRegister[] = [];
  const pluginMap = new Map();

  const plugins = await Promise.all(pluginList.map(async (plugin) => {
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

      return null;
    }

    if (typeof pluginId !== 'string') {
      // TODO: warn
      return null;
    }

    // resolve local plugin
    if (pluginId.startsWith('.')) {
      pluginId = path.resolve(cwd, pluginId);
    }

    pluginMap.set(pluginId, options);

    const pluginEntry = await requireModule(pluginId, cwd);

    return {
      id: pluginId,
      opts: options || {},
      pluginEntry,
    };
  }));

  return plugins.filter(Boolean) as IPluginRegister[];
};

export default resolvePlugins;
