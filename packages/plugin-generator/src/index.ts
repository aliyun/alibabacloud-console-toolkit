import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';
import generate from './generate';
import { getGenerateMap, GeneratorMeta } from './generateMap';


export default (api: PluginAPI, options: PluginOptions) => {
  api.registerAPI('generate', async (opts: any) => await generate(api, opts));

  api.registerSyncAPI('registerGenerator', (name: string, meta: GeneratorMeta) => {
    const maps = getGenerateMap();
    maps[name] = meta;
  });

  api.registerAPI('getGenerateMap', async (name: string, meta: GeneratorMeta) => {
    return getGenerateMap();
  });
};
