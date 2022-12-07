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
          // output: {
          //   path: path.join(outputPath, "deps"),
          // } as any,
          port,
          noOpen: true as any,
          webpack(config) {
            config.output.path = path.resolve(
              process.cwd(),
              outputPath,
              "deps"
            );
            config.output.publicPath = "";
            if (isDev) {
              config.devServer.publicPath = "/deps/";
              config.devServer.writeToDisk = true;
              // 在组件开发场景下，deps中包含组件代码
              // 因此当deps bundle重新编译以后，要刷新页面
              config.devServer.liveReload = true;
              config.devServer.inline = true;
              config.devServer.hot = false;
              // 让sockjs直接请求deps开发服务器
              // 即使宿主开发服务器使用https，deps开发服务器依然要走http。
              // 这里hostname必须为 127.0.0.1 ，才能避免继承宿主应用的https：
              // https://github.com/webpack/webpack-dev-server/blob/699404b091541242ad3d5f38f1a0022a83ff09b2/client-src/default/utils/createSocketUrl.js#L68
              // 使用场景：
              // https://code.alibaba-inc.com/wind/rc-rd-tree/blob/b8f45ae274070bd525e2e9da209e114bb3dc3c38/config/breezr.docs.config.ts#L23
              config.devServer.public = `http://127.0.0.1:${port}`;
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
          disableUpdator: true,
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
