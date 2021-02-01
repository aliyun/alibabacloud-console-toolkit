import * as path from "path";
import { BreezrPresetConfig } from "@alicloud/console-toolkit-preset-official";

const outputPath = process.env.OUTPUT_PATH || "doc-dist";
const servePath = process.env.SERVE_PATH;
const consoleOSId = process.env.CONSOLEOS_ID;
const pkgRoot = path.resolve(__dirname, "../../../");

if (!servePath) {
  throw new Error(`must provide process.env.SERVE_PATH to host`);
}
if (!consoleOSId) {
  throw new Error(`must provide process.env.CONSOLEOS_ID to host`);
}

export const config = ({
  port,
  isDev = true,
}: { port?: number; isDev?: boolean } = {}) => {
  return {
    presets: [
      [
        require.resolve("@alicloud/console-toolkit-preset-official"),
        {
          htmlFileName: path.resolve(pkgRoot, "src2/index.html"),
          typescript: {
            // @ts-ignore
            disableTypeChecker: true,
            useBabel: true,
          },
          port,
          noOpen: true as any,
          // output: {
          //   path: path.join(outputPath, "host"),
          // } as any,
          webpack: (config: any) => {
            config.output.path = path.resolve(
              process.cwd(),
              outputPath,
              "host"
            );
            config.output.publicPath = "/host/";
            if (isDev) {
              config.devServer.publicPath = "/host/";
              config.devServer.writeToDisk = true;
              // config.devServer.open = true;
              // config.devServer.openPage = "host/";
              config.devServer.historyApiFallback = {
                index: "/host/index.html",
              };
              // config.devServer.transportMode = "ws";
              config.devServer.sockPath = "/host/sockjs-node";
            }
            config.entry.index = path.resolve(
              pkgRoot,
              "src2/HostApp/index.tsx"
            );
            return config;
          },
          defineGlobalConstants: {
            __servePath: JSON.stringify(servePath),
            __consoleOSId: JSON.stringify(consoleOSId),
          },
        } as BreezrPresetConfig,
      ],
    ],
    plugins: [path.join(pkgRoot, "lib/config-webpack-plugin.js")],
  };
};
