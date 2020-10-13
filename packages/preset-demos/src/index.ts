import presetWind from "@alicloud/console-toolkit-preset-official";
import * as path from "path";
import * as Chain from "webpack-chain";

export interface IParams {
  getDemos: () => {
    key: string;
    path: string;
  }[];
  demoContainerPath?: string;
  demoWrapperPath?: string;
  chainWebpack?: (configChain: Chain) => void;
  commonModule?: string;
}

export default (params: IParams) => {
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
      useHappyPack: false,
    },
    {}
  );

  presetConfig.plugins.push(
    [
      "@ali/breezr-plugin-os",
      {
        id: "xconsole-demos"
      }
    ],
    [
      require.resolve("./plugin"),
      params
    ]
  );

  return presetConfig;
};
