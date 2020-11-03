import presetWind from "@alicloud/console-toolkit-preset-official";
import * as path from "path";
import * as Chain from "webpack-chain";

export type IExternalItem =
  | string
  | {
      moduleName: string;
      usePathInDev?: string;
    };

export interface IParams {
  consoleOSId?: string;
  chainWebpack?: (configChain: Chain, env: any) => void;
  getDemos?: () => {
    key: string;
    path: string;
    staticMeta?: object;
  }[];
  demoContainerPath?: string;
  demoWrapperPath?: string;
  demoOptsPath?: string;
  initializerPath?: string;
  codesandboxModifierPath?: string;
  getMarkdownEntries?: () => {
    key: string;
    path: string;
    staticMeta?: object;
  }[];
  getNormalEntries?: () => {
    key: string;
    path: string;
    staticMeta?: object;
  }[];
  externals?: IExternalItem[];
  resolveAppServePath?: string;
}

export default (params: IParams, args) => {
  const presetConfig = presetWind(
    {
      disablePolyfill: true,
      disableErrorOverlay: true,
      typescript: {
        // @ts-ignore
        disableTypeChecker: true,
        useBabel: true
      },
      useTerserPlugin: true,
      htmlFileName: path.resolve(__dirname, "../src2/index.html"),
      useHappyPack: false
    },
    args
  );

  presetConfig.plugins.push(
    [
      "@alicloud/console-toolkit-plugin-os",
      {
        id: params.consoleOSId || "console-os-demos",
        cssPrefix: "html"
      }
    ],
    [require.resolve("./main-plugin"), params],
    require.resolve("./config-ts-exclude-plugin")
  );

  return presetConfig;
};
