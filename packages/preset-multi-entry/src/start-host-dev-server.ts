import * as path from "path";
import { Service } from "@alicloud/console-toolkit-core";
import { BreezrPresetConfig } from "@alicloud/console-toolkit-preset-official";
import getPort from "get-port";

getPort().then(port => {
  const service = new Service({
    cwd: process.cwd(),
    config: {
      presets: [
        [
          require.resolve("@alicloud/console-toolkit-preset-official"),
          {
            htmlFileName: path.resolve(__dirname, "../src2/index.html"),
            // entry: path.resolve(__dirname, "../src2/HostApp/index.ts"),
            typescript: {
              // @ts-ignore
              disableTypeChecker: true,
              useBabel: true
            },
            port: String(port),
            webpack: (config: any) => {
              config.output.publicPath = "/host/";
              config.devServer.publicPath = "/host/";
              // config.devServer.open = true;
              // config.devServer.openPage = "host/";
              config.devServer.historyApiFallback = {
                index: "/host/index.html"
              };
              config.entry.index = path.resolve(
                __dirname,
                "../src2/HostApp/index.tsx"
              );
              return config;
            },
            defineGlobalConstants: {
              __servePath: JSON.stringify(process.env.SERVE_PATH),
              __consoleOSId: JSON.stringify(process.env.CONSOLEOS_ID)
            },
            noOpen: true as any
          } as BreezrPresetConfig
        ]
      ],
      plugins: [
        require.resolve("./config-ts-exclude-plugin"),
        [
          require.resolve("./host-dev-server-plugin"),
          {
            externals: process.env.EXTERNALS
              ? JSON.parse(process.env.EXTERNALS)
              : undefined
          }
        ]
      ]
    }
  });
  service.run("start");
  service.on("onServerRunning", () => {
    if (process.send) {
      process.send({
        type: "server_started",
        port: port
      });
    }
  });
});
