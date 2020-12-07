import * as path from "path";
import { BreezrPresetConfig } from "@alicloud/console-toolkit-preset-official";

const outputPath = process.env.OUTPUT_PATH || "doc-dist";
const depsConsoleOSId = process.env.CONSOLEOS_ID + "-deps";
const externals = process.env.EXTERNALS
  ? JSON.parse(process.env.EXTERNALS)
  : undefined;
const pkgRoot = path.resolve(__dirname, "../../../");

if (!process.env.CONSOLEOS_ID) {
  throw new Error(`must provide process.env.CONSOLEOS_ID to deps`);
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
          disablePolyfill: true,
          disableErrorOverlay: true,
          typescript: {
            // @ts-ignore
            disableTypeChecker: true,
            useBabel: true,
          },
          useTerserPlugin: true,
          htmlFileName: path.resolve(pkgRoot, "src2/index.html"),
          useHappyPack: false,
          hashPrefix: depsConsoleOSId,
          output: {
            path: path.join(outputPath, "deps"),
          } as any,
          port,
          noOpen: true as any,
          webpack(config) {
            config.output.publicPath = "";
            if (isDev) {
              config.devServer.publicPath = "/deps/";
              config.devServer.writeToDisk = true;
            }
            config.entry = path.join(pkgRoot, "src2/BuildDeps/index.ts");
            config.externals = {
              react: {
                root: "React",
                commonjs2: "react",
                commonjs: "react",
                amd: "react",
              },
              "react-dom": {
                root: "ReactDOM",
                commonjs2: "react-dom",
                commonjs: "react-dom",
                amd: "react-dom",
              },
            };
            return config;
          },
        } as BreezrPresetConfig,
      ],
    ],
    plugins: [
      [
        "@alicloud/console-toolkit-plugin-os",
        {
          id: depsConsoleOSId,
          cssPrefix: "html",
        },
      ],
      [path.join(pkgRoot, "lib/config-webpack-plugin.js")],
      [
        path.join(pkgRoot, "lib/build-external-deps.js"),
        {
          externals,
        },
      ],
    ],
  };
};
