import presetWind from "@alicloud/console-toolkit-preset-official";
import globby from "globby";
import * as path from "path";
import * as fs from "fs-extra";
import * as Chain from "webpack-chain";
export type { IDemoOpts } from "@alicloud/console-toolkit-docs-shared";
import { getEnv } from "@alicloud/console-toolkit-shared-utils";

export type IExternalItem =
  | string
  | {
      moduleName: string;
      usePathInDev?: string;
    };

export interface IParams {
  consoleOSId: string;
  chainWebpack?: (configChain: Chain, env: any) => void;
  // 由于breezr的plugin不支持异步返回，因此，getDemos等函数也必须是同步的
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
  getTypeInfoEntries?: () => {
    key: string;
    path: string;
    staticMeta?: object;
  }[];
  externals?: IExternalItem[];
  resolveAppServePath?: string;
  output?: string;
  devServer?: {
    https?: boolean;
    host?: string;
  };
}

export default (params: IParams, args) => {
  const env = getEnv();
  const cwd = env.workingDir ?? process.cwd();
  if (env.isCloudBuild() && env.buildDestDir) {
    params.output = env.buildDestDir;
  } else {
    params.output = params.output ?? "doc-dist";
  }
  if (!params.getDemos) {
    const baseDir = path.resolve(cwd, "demos");
    // 默认从demos目录查找demo
    if (fs.existsSync(baseDir)) {
      params.getDemos = () => {
        const paths = globby.sync("**/*.demo.tsx", { cwd: baseDir });
        return paths.map((relativePath) => {
          //  const fileName = path.basename(relativePath)
          const demoName = relativePath.replace(/\.demo\.tsx?$/, "");
          // 对于每个demo，要返回demo key和demo路径
          return {
            key: demoName,
            path: path.resolve(baseDir, relativePath),
          };
        });
      };
    }
  }
  if (!params.getMarkdownEntries) {
    const baseDir = path.resolve(cwd, "docs");
    const READMEPath = path.resolve(cwd, "README.md");
    params.getMarkdownEntries = () => {
      const result: { key: string; path: string }[] = [];
      if (fs.existsSync(READMEPath)) {
        result.push({
          key: "README",
          path: READMEPath,
        });
      }
      if (fs.existsSync(baseDir)) {
        const paths = globby.sync("**/*.doc.md?(x)", { cwd: baseDir });
        result.push(
          ...paths.map((relativePath) => {
            //  const fileName = path.basename(relativePath)
            const docName = relativePath.replace(/\.doc\.mdx?$/, "");
            // 对于每个doc，要返回key和路径
            return {
              key: `docs/${docName}`,
              path: path.resolve(baseDir, relativePath),
            };
          })
        );
      }
      return result;
    };
  }
  if (!params.getTypeInfoEntries) {
    const baseDir = path.resolve(cwd, "src/types");
    if (fs.existsSync(baseDir)) {
      params.getTypeInfoEntries = () => {
        const paths = globby.sync("**/*.type.ts?(x)", { cwd: baseDir });
        return paths.map((relativePath) => {
          const typeName = relativePath.replace(/\.type\.tsx?$/, "");
          return {
            key: `types/${typeName}`,
            path: path.resolve(baseDir, relativePath),
          };
        });
      };
    }
  }

  params.consoleOSId = params.consoleOSId || "console-os-demos";

  if (params.consoleOSId.includes("/") || params.consoleOSId.includes("\\"))
    throw new Error(
      `consoleOSId 不能包含'/'和'\\'符号，您可以用'-'或'_'来代替`
    );

  const presetConfig = presetWind(
    {
      disablePolyfill: true,
      disableErrorOverlay: true,
      typescript: {
        // @ts-ignore
        disableTypeChecker: true,
        useBabel: true,
      },
      useTerserPlugin: true,
      htmlFileName: path.resolve(__dirname, "../src2/index.html"),
      useHappyPack: false,
      // @ts-ignore
      hashPrefix: params.consoleOSId,
      // @ts-ignore
      // output: {
      //   path: params.output
      // }
      babelPluginWindRc: false,
      https: params.devServer?.https === true || args.https === true,
      host: args.host ?? params.devServer?.host,
    },
    args
  );

  presetConfig.plugins.push(
    [
      "@alicloud/console-toolkit-plugin-os",
      {
        id: params.consoleOSId,
        cssPrefix: "html",
      },
    ],
    [require.resolve("./main-plugin"), params],
    [require.resolve("./assets-upload-plugin"), params],
    require.resolve("./config-webpack-plugin")
  );

  return presetConfig;
};
