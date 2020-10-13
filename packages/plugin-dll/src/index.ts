
import * as webpack from 'webpack';
import { resolve } from 'path';
import * as serveStatic from 'serve-static';
import { copyFileSync, existsSync } from 'fs';
import * as Chain from 'webpack-chain';
import { PluginAPI } from '@alicloud/console-toolkit-core';
import { IOption } from './type';
import buildDll from './buildDll';
import { getEnv } from '@alicloud/console-toolkit-shared-utils';
import { getDeps } from './utils';


export default async (api: PluginAPI, options: IOption) => {
  const {
    dllOutputDir = resolve(api.getCwd(), 'dll'),
  } = options;

  api.dispatchSync('registerBeforeDevStart', async () => {
    await runDll(api, options);
    api.dispatchSync('addMiddleware', serveStatic(dllOutputDir));
  });

  api.dispatchSync('registerBeforeBuildStart', async () => {
    await runDll(api, options);
  });

  api.on('onBuildEnd', async () => {
    const deps = getDeps(dllOutputDir);
    if (!deps) {
      return;
    }
    const env = getEnv();
    const dllPath = resolve(dllOutputDir, deps.dllName);
    if (existsSync(dllPath)) {
      if (env.isCloudBuild() && env.buildDestDir) {
        copyFileSync(dllPath, resolve(env.buildDestDir, deps.dllName));
      } else {
        copyFileSync(dllPath, resolve(api.getCwd(), `./build/${deps.dllName}`));
      }
    }
  });
};

const runDll = async (api: PluginAPI, options: IOption) => {
  const {
    dllOutputDir = resolve(api.getCwd(), 'dll'),
    scriptAttr = {}
  } = options;

  await buildDll(api, options);

  const deps = getDeps(dllOutputDir);

  if (!deps) {
    return;
  }

  api.on('onChainWebpack', async (config: Chain) => {
    config.entryPoints.delete('vendor');
    config.plugin('dll-reference').use(webpack.DllReferencePlugin, [
      {
        context: config.get('context'),
        manifest: resolve(dllOutputDir, 'breezr.json'),
      },
    ]);
  });

  const scriptAttrStr = Object.entries(scriptAttr).map(([key, value]) => `${key}="${value}"`).join(' ');

  api.dispatchSync('addHtmlScript', `
  <script src="/${deps.dllName}" ${scriptAttrStr}>
  </script>
  `);
};
