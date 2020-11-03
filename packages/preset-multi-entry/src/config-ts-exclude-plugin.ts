import * as Chain from "webpack-chain";
import { Evnrioment } from "@alicloud/console-toolkit-shared-utils";
import * as path from "path";

module.exports = (api: any) => {
  api.on("onChainWebpack", (config: Chain, env: Evnrioment) => {
    // 允许编译本包中的ts
    config.module
      .rule("ts")
      .exclude.clear()
      .add({
        not: [path.resolve(__dirname, "../src2")],
        and: [/node_modules/]
      })
      .end();
  });
};
