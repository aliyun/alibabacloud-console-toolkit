import { PluginConfig, Service, PluginAPI } from "../lib";

test("run help throw no exception", async () => {

  return new Promise((resolve) => {
    const service = new Service({ cwd: __dirname });
    service.initPlugin({
      id: 'local:test',
      pluginEntry: (api: PluginAPI) => {
        setTimeout(() => {
          const config = api.dispatchSync<PluginConfig>('getConfig');
          console.log(config);
          resolve();
        }, 1000);
      }
    });
    service.run('help', {});
  });
});
