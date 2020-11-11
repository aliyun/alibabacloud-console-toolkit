import * as Chain from "webpack-chain";
import { Evnrioment, getEnv } from "@alicloud/console-toolkit-shared-utils";
import * as cp from "child_process";
import * as path from "path";
import VirtualModulesPlugin from "webpack-virtual-modules";
import historyFallback from "connect-history-api-fallback";
import createProxyMiddleware from "http-proxy-middleware";
import open from "open";
import { createWriteStream } from "fs";
import { Service } from "@alicloud/console-toolkit-core";

import { IParams, IExternalItem } from "./index";

module.exports = (api: any, opts: IParams, args: any) => {
  const virtualModules: { [path: string]: string } = {};
  const entryListItemCode = [] as string[];
  const entryListImportCode = [] as string[];

  const demoContainerPath =
    opts.demoContainerPath || path.resolve(__dirname, "../src2/DemoContainer");
  virtualModules[
    "/@DemoContainer"
  ] = `export { default } from '${demoContainerPath}';`;

  const demoWrapperPath =
    opts.demoWrapperPath || path.resolve(__dirname, "../src2/DemoWrapper");
  virtualModules[
    "/@DemoWrapper"
  ] = `export { default } from '${demoWrapperPath}';`;

  const demoOptsPath =
    opts.demoOptsPath || path.resolve(__dirname, "../src2/demoOpts");
  virtualModules["/@demoOpts"] = `export { default } from '${demoOptsPath}';`;

  virtualModules["/@initializer"] = opts.initializerPath
    ? `import "${opts.initializerPath}"`
    : "";
  virtualModules["/@codesandboxModifier"] = opts.codesandboxModifierPath
    ? `export { default } from '${opts.codesandboxModifierPath}';`
    : `export default (files) => files`;

  if (typeof opts.getDemos === "function") {
    opts.getDemos().forEach(({ key, path: demoPath, staticMeta = {} }, idx) => {
      const staticMetaVirtualModulePath = generateVirtualPath(
        "static-meta",
        key
      );
      virtualModules[staticMetaVirtualModulePath] = `
          import { staticMeta as staticMetaFromFile } from "!!js-file-static-meta-loader!${demoPath}";
          const staticMetaFromFindAPI = ${JSON.stringify(staticMeta)};
          export const staticMeta = Object.assign({}, staticMetaFromFile, staticMetaFromFindAPI, {_type:"demo"});
        `;

      const virtualModulePath = generateVirtualPath("entry", key);
      if (virtualModules[virtualModulePath]) {
        throw new Error(`duplicate key "${key}"`);
      }
      virtualModules[virtualModulePath] = `
          import * as m from "${demoPath}";
          import { imports, code, deps } from "!!demo-info-loader!${demoPath}";

          // 避免webpack做编译时分析，发现demoPath里面没有export meta造成warning
          const { default:demo, meta = {} } = (void 0, m);
          export { demo, meta, code, imports, deps };
        `;
      entryListImportCode.push(`
          import { staticMeta as demoStaticMeta${idx} } from "${staticMetaVirtualModulePath}";
        `);
      entryListItemCode.push(
        `{key: '${key}', staticMeta: demoStaticMeta${idx}, load: () => import('${virtualModulePath}')}`
      );
    });
  }

  if (typeof opts.getMarkdownEntries === "function") {
    opts
      .getMarkdownEntries()
      .forEach(({ key, path: entryPath, staticMeta = {} }, idx) => {
        const staticMetaVirtualModulePath = generateVirtualPath(
          "static-meta",
          key
        );
        virtualModules[staticMetaVirtualModulePath] = `
          import { staticMeta as staticMetaFromFile } from "!!md-file-static-meta-loader!${entryPath}";
          const staticMetaFromFindAPI = ${JSON.stringify(staticMeta)};
          export const staticMeta = Object.assign({}, staticMetaFromFile, staticMetaFromFindAPI, {_type:"md"});
        `;
        entryListImportCode.push(`
          import { staticMeta as mdStaticMeta${idx} } from "${staticMetaVirtualModulePath}";
        `);

        const virtualModulePath = generateVirtualPath("entry", key);
        if (virtualModules[virtualModulePath]) {
          throw new Error(`duplicate key "${key}"`);
        }
        virtualModules[virtualModulePath] = `
          import markdownSource from "${entryPath}";
          import React from "react";
          // 在这个模块才引入markdown-renderer，而不是在Loader引入
          // 避免所有使用loader的用户都被迫加载markdown-renderer（他可能不需要）
          import { MarkdownRenderer } from "@alicloud/console-toolkit-markdown-renderer";

          export default (props) => {
            return React.createElement(MarkdownRenderer, Object.assign({ source: markdownSource }, props));
          };
      `;
        entryListItemCode.push(
          `{key: '${key}', staticMeta: mdStaticMeta${idx}, load: () => import('${virtualModulePath}')}`
        );
      });
  }
  if (typeof opts.getNormalEntries === "function") {
    opts
      .getNormalEntries()
      .forEach(({ key, path: entryPath, staticMeta = {} }, idx) => {
        const staticMetaVirtualModulePath = generateVirtualPath(
          "static-meta",
          key
        );
        virtualModules[staticMetaVirtualModulePath] = `
      import { staticMeta as staticMetaFromFile } from "!!js-file-static-meta-loader!${entryPath}";
      const staticMetaFromFindAPI = ${JSON.stringify(staticMeta)};
      export const staticMeta = Object.assign({}, staticMetaFromFile, staticMetaFromFindAPI, {_type:"normal"});
    `;
        entryListImportCode.push(`
      import { staticMeta as normalStaticMeta${idx} } from "${staticMetaVirtualModulePath}";
    `);

        const virtualModulePath = generateVirtualPath("entry", key);
        if (virtualModules[virtualModulePath]) {
          throw new Error(`duplicate key "${key}"`);
        }
        virtualModules[virtualModulePath] = `
          export * from "${entryPath}";
          export { default } from "${entryPath}";
      `;

        entryListItemCode.push(
          `{key: '${key}', staticMeta: normalStaticMeta${idx}, load: () => import('${virtualModulePath}')}`
        );
      });
  }

  virtualModules["/@entry-list"] = `
  ${entryListImportCode.join("\n")}
  export default [${entryListItemCode.join(",")}];`;

  // 仅用于本地开发的 id => ServePath 解析逻辑
  // 以便本地开发的时候能够从本地加载当前微应用
  virtualModules[
    "/@resolveAppServePathForLocalDev"
  ] = `export default undefined;`;

  // 开发者配置微应用的 id => ServePath 解析逻辑
  if (opts.resolveAppServePath) {
    virtualModules[
      "/@resolveAppServePathFromDeveloper"
    ] = `export {default} from "${opts.resolveAppServePath}";`;
  } else {
    virtualModules[
      "/@resolveAppServePathFromDeveloper"
    ] = `export default undefined;`;
  }

  const isBuild = !getEnv().isDev();
  if (isBuild) {
    api.dispatchSync("registerBeforeBuildStart", async () => {
      // 构建被微应用external掉的依赖，以便在demo-viewer上加载渲染
      await buildExternaledDeps({
        cwd: api.getCwd(),
        consoleOSId: opts.consoleOSId,
        output: opts.output!,
        externals: opts.externals
      });
    });
  }

  api.on("onChainWebpack", (config: Chain, env: Evnrioment) => {
    config
      .entry("index")
      .clear()
      .add(path.resolve(__dirname, "../src2/index.tsx"))
      .end()
      .context(path.resolve(__dirname, "../src2"))
      .plugin("demos-module")
      .use(VirtualModulesPlugin, [virtualModules])
      .end()
      // `/@demos/${key}` 中的模块查找 raw-loader 时，
      // 按照正常的node_modules查找算法，会直接去找/node_modules然后放弃
      // 我们要让webpack能在/@demos虚拟路径中找到loader
      .resolveLoader.alias.set(
        "demo-info-loader",
        path.resolve(__dirname, "./demo-info-loader")
      )
      .set(
        "js-file-static-meta-loader",
        path.resolve(__dirname, "./js-file-static-meta-loader")
      )
      .set(
        "md-file-static-meta-loader",
        path.resolve(__dirname, "./md-file-static-meta-loader")
      )
      .end()
      .end()
      .module.rule("md")
      .test(/\.md$/)
      .rule("raw-loader")
      .use("raw-loader")
      .loader(require.resolve("raw-loader"))
      .end()
      .end()
      .end();

    config.output.publicPath("");

    config.externals(
      (() => {
        const externals = {
          react: {
            root: "React",
            commonjs2: "react",
            commonjs: "react",
            amd: "react"
          },
          "react-dom": {
            root: "ReactDOM",
            commonjs2: "react-dom",
            commonjs: "react-dom",
            amd: "react-dom"
          },
          "@alicloud/console-os-environment":
            "@alicloud/console-os-environment",
          "@breezr-doc-internals/externaled-deps":
            "@breezr-doc-internals/externaled-deps"
        };
        opts.externals?.forEach(item => {
          if (typeof item === "string") {
            externals[item] = item;
          } else {
            externals[item.moduleName] = item.moduleName;
          }
        });
        return externals;
      })()
    );

    if (env.isDev()) {
      config.plugins.delete("openBrowser");
      config.devServer.disableHostCheck(true);
      config.devServer.headers({
        "Access-Control-Allow-Origin": "*"
      });
      config.devServer.open(false);

      const port = config.devServer.get("port");
      const https = config.devServer.get("https");
      const host = config.devServer.get("host");
      const servePath = `http${https ? "s" : ""}://${host}:${port}/`;

      let childPort;
      config.devServer.before(function(app, server, compiler) {
        // webpack dev server自带的fallback和proxy一起使用时，
        // 在这种情况下会有bug，因此我们自己配置fallback和proxy
        app.use(
          historyFallback({
            index: "/host/index.html"
          })
        );
        app.use(
          "/host",
          createProxyMiddleware({
            target: "http://localhost:8889",
            router: req => {
              if (!childPort) {
                throw new Error("childProcess is not ready yet");
              }
              return `http://localhost:${childPort}`;
            }
          })
        );
      });

      let childProcess: cp.ChildProcess = cp.fork(
        path.resolve(__dirname, "./start-host-dev-server.js"),
        {
          cwd: api.getCwd(),
          env: {
            SERVE_PATH: servePath,
            CONSOLEOS_ID: opts.consoleOSId,
            // externals参数会经过序列化传递给子进程，所以只能使用支持json化的值
            EXTERNALS: JSON.stringify(opts.externals)
          },
          silent: true
        }
      );

      childProcess.on("message", msg => {
        if (msg && msg.type === "server_started") {
          childPort = msg.port;
          open(servePath);
        }
      });

      const logStream = createWriteStream(
        path.join(__dirname, "child_server_log.log")
      );
      childProcess.stdout?.pipe(logStream);
      childProcess.stderr?.pipe(logStream);

      virtualModules["/@resolveAppServePathForLocalDev"] = `
        export default function resolveAppServePath(appId) {
          if (appId === "${opts.consoleOSId}") {
            return "${servePath}";
          }
        }
      `;
    }
    if (typeof opts.chainWebpack === "function") {
      opts.chainWebpack(config, env);
    }
  });
};

function generateVirtualPath(category: string, key: string) {
  if (!["static-meta", "entry"].includes(category)) {
    throw new Error(`invalid category "${category}"`);
  }
  return path.resolve(
    __dirname,
    "_virtual_module_",
    `_${category}_`,
    key,
    "virtual.js"
  );
}

async function buildExternaledDeps({
  cwd,
  consoleOSId,
  output,
  externals
}: {
  cwd: string;
  consoleOSId: string;
  output: string;
  externals?: IExternalItem[];
}) {
  console.log("开始构建微应用external依赖...");
  const depsConsoleOSId = consoleOSId + "-deps";
  const service = new Service({
    cwd,
    config: {
      presets: [
        [
          require.resolve("@alicloud/console-toolkit-preset-official"),
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
            hashPrefix: depsConsoleOSId,
            output: {
              path: path.join(output, "deps")
            },
            webpack(config) {
              config.entry = path.join(__dirname, "../src2/BuildDeps/index.ts");
              config.output.publicPath = "";
              config.externals = {
                react: {
                  root: "React",
                  commonjs2: "react",
                  commonjs: "react",
                  amd: "react"
                },
                "react-dom": {
                  root: "ReactDOM",
                  commonjs2: "react-dom",
                  commonjs: "react-dom",
                  amd: "react-dom"
                }
              };
              return config;
            }
          }
        ]
      ],
      plugins: [
        [
          "@alicloud/console-toolkit-plugin-os",
          {
            id: depsConsoleOSId,
            cssPrefix: "html"
          }
        ],
        [require.resolve("./config-webpack-plugin")],
        [
          require.resolve("./build-external-deps"),
          {
            externals
          }
        ]
      ]
    }
  });
  await service.run("build");
  console.log("成功构建微应用external依赖");
}
