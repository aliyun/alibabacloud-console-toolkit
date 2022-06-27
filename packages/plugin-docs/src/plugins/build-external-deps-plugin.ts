import path from 'path';

import * as Chain from 'webpack-chain';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import { Evnrioment } from '@alicloud/console-toolkit-shared-utils';

import { IExternalItem } from '../types/IExternalItem';

module.exports = (
  api: any,
  opts: { externals?: IExternalItem[] },
  args: any
) => {
  api.on('onChainWebpack', (config: Chain, env: Evnrioment) => {
    const virtualModules: { [path: string]: string } = {};
    // 这个虚拟模块可能会包含对用户node_modules的import，
    // 因此虚拟模块的路径应该在用户项目中
    const virtualModulePath = path.join(
      api.getCwd(),
      '_virtual_module_',
      'externaled-deps'
    );

    virtualModules[
      '/@externaled-deps'
    ] = `export {default} from "${virtualModulePath}";`;

    // 本地开发时，宿主应用要提供被external掉的依赖
    if (!Array.isArray(opts.externals) || opts.externals.length === 0) {
      virtualModules[virtualModulePath] = `
        export default undefined;
      `;
    } else {
      const importsCode = [] as string[];
      const objPropertiesCode = [] as string[];
      opts.externals.forEach((item, idx) => {
        let moduleName, importPath;
        if (typeof item === 'string') {
          moduleName = importPath = item;
        } else {
          moduleName = item.moduleName;
          importPath = item.usePathInDev || moduleName;
        }
        importsCode.push(`import * as dep${idx} from "${importPath}";`);
        objPropertiesCode.push(`"${moduleName}": dep${idx},`);
      });
      virtualModules[virtualModulePath] = `
        ${importsCode.join('\n')}
        export default {
          ${objPropertiesCode.join('\n')}
        };
      `;
    }

    config
      .plugin('virtual-module')
      .use(new VirtualModulesPlugin(virtualModules));
  });
};
