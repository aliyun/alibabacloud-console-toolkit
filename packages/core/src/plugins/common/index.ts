import { unwatch, RESTART } from "@alicloud/console-toolkit-shared-utils";

import { PluginAPI } from "../../PluginAPI";

export default (api: PluginAPI) => {
  api.registerSyncAPI('restart', () => {
    unwatch();
    if (process.send) {
      process.send({ type: RESTART });
    }
  });
};
