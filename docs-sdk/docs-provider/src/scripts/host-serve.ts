import { Service } from "@alicloud/console-toolkit-core";
import getPort from "get-port";
import { config } from "./configs/host";

getPort().then((port) => {
  console.log("开始serve本地开发的宿主应用");
  const service = new Service({
    cwd: process.cwd(),
    config: config({ port }),
  });
  service.run("start");
  service.on("onServerRunning", () => {
    console.log("serve本地开发的宿主应用成功");
    if (process.send) {
      process.send({
        type: "server_started",
        port: port,
      });
    }
  });
});
