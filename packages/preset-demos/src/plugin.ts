import * as Chain from "webpack-chain";
import { Evnrioment } from "@alicloud/console-toolkit-shared-utils";
import * as path from "path";
import VirtualModulesPlugin from "webpack-virtual-modules";
import { IParams } from "./index";

module.exports = (api: any, opts: IParams) => {
  const virtualModules: { [path: string]: string } = {};
  const demoListCodeLine = [] as string[];
  opts.getDemos().forEach(({ key, path: demoPath }) => {
    let virtualModulePath = path.resolve("/@demos", key);
    virtualModules[virtualModulePath] = `
      import * as m from "${demoPath}";
      import code from "!!raw-loader!${demoPath}";
      // 避免webpack做编译时分析，发现demoPath里面没有export meta造成warning
      const { default:demo, meta } = (void 0, m);
      export { demo, meta, code };
    `;
    if (opts.commonModule) {
      virtualModules[virtualModulePath] =
        `import "${opts.commonModule}";\n` + virtualModules[virtualModulePath];
    }
    demoListCodeLine.push(
      `{key: '${key}', load: () => import('${virtualModulePath}')}`
    );
  });
  virtualModules["/@demos-list"] = `export default [${demoListCodeLine.join(
    ","
  )}];`;

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
      .resolveLoader.alias.set("raw-loader", require.resolve("raw-loader"))
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
      .loader(require.resolve("@alife/fusion-css-loader"))
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
      .end();

    config.devServer.open(false);
    if (env.isDev() && process.env.DEV_SERVE === "true") {
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
      opts.chainWebpack(config);
    }
  });
};
