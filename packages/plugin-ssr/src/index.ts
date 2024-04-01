import * as path from 'path';
import { debounce } from 'lodash';
import * as express from 'express';
import * as webpack from 'webpack';
import * as chokidar from 'chokidar';
import * as Chain from 'webpack-chain';

import { PluginAPI } from '@alicloud/console-toolkit-core';
import { done, getEnv } from "@alicloud/console-toolkit-shared-utils";

import { IOption } from './types';
import renderCmdHandler from './cmd/render';
import doctorCmdHandler from './cmd/doctor';
import buildServer from './buildServer';

export default async (api: PluginAPI, options: IOption) => {
  const { devServerRender = false, microApp } = options;

  api.registerCommand('ssr:render', {
    usage: `breezr ssr:render [options] <file>`,
    description: 'get ssr result',
    options: {
      '--config': 'console config 的 json 文件',
      '--path': '要渲染的路由'
    }
  }, renderCmdHandler);

  api.registerCommand('ssr:doctor', {
    usage: `breezr ssr:doctor [options] <file>`,
    description: '对 ssr 结果做测试，发现问题',
    details: '对 ssr 结果做测试，发现问题',
    options: {
      '--config': 'console config 的 json 文件',
      '--path': '要渲染的路由',
      '--renderNumber': '渲染次数',
      '--snapshot': '输出 js 的堆栈',
    }
  }, doctorCmdHandler);

  if (getEnv().isDev() && !devServerRender) {
    return;
  }

  // ssr for dev env
  api.dispatchSync('registerBeforeDevStart',  async () => {
    await buildServer(api, options)
    await watchAndBuild(api, options);
  });

  api.on('onChainWebpack', async (config: Chain) => {
    const originBefore = config.devServer.get('before');
    config.devServer.before((app, server, compiler) => {
      app.use(serveSSR(path.resolve(config.output.get('path'), 'server/index.js'), compiler));
      if (originBefore) {
        originBefore(app, server, compiler)
      }
    })
    if (microApp) {
      api.dispatchSync('configMicroAppSSREntry', `${config.output.get('publicPath')}server/index.js`)
    }
  });

  // ssr for prod build
  api.dispatchSync('registerBeforeBuildStart',  async () => {
    await buildServerBundle(api, options);
  });
}

async function watchAndBuild(api: PluginAPI, options: IOption) {
  const watcher = chokidar.watch('./src/**', { ignored: "./src/.xconsole/**"})
    .on('all', debounce(() => {
      done('监听到 src 下文件变化，重新生成 server 内容');
      buildServerBundle(api, options);
    }, 100));

  process.on('SIGINT', () => {
    watcher.close();
  });
}

const buildServerBundle = async (api: PluginAPI, opts: IOption) => {
  await buildServer(api, opts)
}


const ssrRender = (serverEntryPath: string,req: express.Request, res: express.Response, compiler: webpack.Compiler) => {
  try {
    delete require.cache[serverEntryPath];
    const entry = require(serverEntryPath);
    const content = entry.default({ location: req.path });

    // todo replace hard code
    // @ts-ignore
    const html = compiler.outputFileSystem.readFileSync(path.resolve(compiler.outputPath, 'index.html'), 'UTF-8')

    const str = html.replace('<div id="app"></div>', `<div id="app">${content}</div>`);
    res.set('Content-Type', 'text/html')
    res.write(str);
  } catch(e) {
    res.write((e as Error).toString());
    res.write((e as Error).stack);
  }
  res.end();
}

const serveSSR = (serverEntryPath: string, compiler: webpack.Compiler) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!compiler.outputFileSystem) {
    return next()
  }

  // @ts-ignore
  compiler.outputFileSystem.readFile(path.resolve(compiler.outputPath, req.path), (err) => {
 
    if (req.url.indexOf('ssr=true') !== -1) {
      return ssrRender(serverEntryPath, req, res, compiler)
    }
    next()
  });
}
