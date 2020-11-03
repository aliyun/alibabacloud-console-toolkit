import * as Chain from "webpack-chain";
import { Evnrioment } from "@alicloud/console-toolkit-shared-utils";
import { IExternalItem } from "./index";
import VirtualModulesPlugin from "webpack-virtual-modules";

module.exports = (
  api: any,
  opts: { externals?: IExternalItem[] },
  args: any
) => {
  api.on("onChainWebpack", (config: Chain, env: Evnrioment) => {
    const virtualModules: { [path: string]: string } = {};

    // 本地开发时，宿主应用要提供被external掉的依赖
    if (!opts.externals) {
      virtualModules["/@externaled-deps"] = `
        export default undefined;
      `;
    } else {
      const importsCode = [] as string[];
      const objPropertiesCode = [] as string[];
      opts.externals.forEach((item, idx) => {
        let moduleName, importPath;
        if (typeof item === "string") {
          moduleName = importPath = item;
        } else {
          moduleName = item.moduleName;
          importPath = item.usePathInDev || moduleName;
        }
        importsCode.push(`import * as dep${idx} from "${importPath}";`);
        objPropertiesCode.push(`"${moduleName}": dep${idx},`);
      });
      virtualModules["/@externaled-deps"] = `
        ${importsCode.join("\n")}
        export default {
          ${objPropertiesCode.join("\n")}
        };
      `;
    }
    config
      .plugin("virtual-module")
      .use(new VirtualModulesPlugin(virtualModules));
  });
};
