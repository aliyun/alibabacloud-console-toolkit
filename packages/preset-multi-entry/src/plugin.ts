import * as Chain from "webpack-chain";
import { Evnrioment } from "@alicloud/console-toolkit-shared-utils";
import * as path from "path";
import VirtualModulesPlugin from "webpack-virtual-modules";
import { IParams } from "./index";

module.exports = (api: any, opts: IParams) => {
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
          import { imports, code } from "!!demo-info-loader!${demoPath}";

          // 避免webpack做编译时分析，发现demoPath里面没有export meta造成warning
          const { default:demo, meta = {} } = (void 0, m);
          export { demo, meta, code, imports };
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
            return <MarkdownRenderer source={markdownSource} {...props} />
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

  api.on("onChainWebpack", (config: Chain, env: Evnrioment) => {
    config
      .entry("index")
      .clear()
      .add(path.resolve(__dirname, "../src2/index.tsx"))
      .end()
      .context(path.resolve(__dirname, "../src2"))
      .plugin("demos-module")
      .use(new VirtualModulesPlugin(virtualModules))
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
      // 修改fusion前缀，样式隔离
      .module.rules.delete("css")
      .end()
      .rule("css")
      .test(/\.css$/)
      .rule("style-loader")
      .use("style-loader")
      .loader(require.resolve("style-loader"))
      .end()
      .end()
      .rule("css-loader")
      .use("css-loader")
      .loader(require.resolve("css-loader"))
      .end()
      .end()
      .rule("fusion-css-loader")
      .resourceQuery(/fusionPrefix/)
      .use("fusion-css-loader")
      .loader(require.resolve("@alicloud/console-toolkit-fusion-css-loader"))
      .end()
      .end()
      .end()
      .rule("ts")
      .exclude.clear()
      .add({
        not: [path.resolve(__dirname, "../src2")],
        and: [/node_modules/]
      })
      .end()
      .end()
      .rule("md")
      .test(/\.md$/)
      .rule("raw-loader")
      .use("raw-loader")
      .loader(require.resolve("raw-loader"))
      .end()
      .end()
      .end();

    config.devServer.open(false);
    if (env.isDev() && process.env.DEV_SERVE === "true") {
      config.devServer.disableHostCheck(true);
      config.devServer.headers({
        "Access-Control-Allow-Origin": "*"
      });
      config.plugins.delete("openBrowser");
    }

    if (env.isDev() && process.env.DEV_SERVE !== "true") {
      config
        .entry("index")
        .clear()
        .add(path.resolve(__dirname, "../src2/dev-index.tsx"));
      const port = config.devServer.get("port");
      const https = config.devServer.get("https");
      const host = config.devServer.get("host");
      config.plugin("virtual-module").use(VirtualModulesPlugin, [
        {
          "/.webpack_virtual/@alicloud/console-os-environment": `export default {publicPath: "http${
            https ? "s" : ""
          }://${host}:${port}/"}`
        }
      ]);
      config.resolve.alias.set(
        "@alicloud/console-os-environment",
        "/.webpack_virtual/@alicloud/console-os-environment"
      );
    } else {
      config.output.publicPath("");
      config.externals({
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
        "@alicloud/console-os-environment": "@alicloud/console-os-environment"
      });
    }
    if (typeof opts.chainWebpack === "function") {
      opts.chainWebpack(config, env);
    }
  });
};

function generateVirtualPath(category: string, key: string) {
  if (!["static-meta", "entry"].includes(category))
    throw new Error(`invalid category "${category}"`);
  return path.resolve(
    __dirname,
    "_virtual_module_",
    `_${category}_`,
    key,
    "virtual.js"
  );
}
