import { PluginAPI, CommandArgs } from '@alicloud/console-toolkit-core';

/**
 *
 * @param api
 * @param opts
 */
async function init(api: PluginAPI, opts: CommandArgs) {
  api.emit('onGenerating', opts);
  await api.dispatch('generate', opts);
}

export default function(api: PluginAPI) {
  api.registerCommand(
    'init',
    {
      description: 'init wind project',
      usage: 'init a wind project'
    },
    async (opts: any) => {
      await init(api, opts);
    }
  );
}
