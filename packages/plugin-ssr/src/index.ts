import * as fs from 'fs';
import * as path from 'path';
import { debounce } from 'lodash';
import * as express from 'express';
import * as webpack from 'webpack';
import * as chokidar from 'chokidar';
import * as Chain from 'webpack-chain';

import { PluginAPI } from '@alicloud/console-toolkit-core';
import { done, getEnv } from "@alicloud/console-toolkit-shared-utils";

import { IOption } from './types';
import buildServer from './buildServer';

export default async (api: PluginAPI, options: IOption) => {
  const { devServerRender = true } = options;

  api.registerCommand('ssr:render', {
    usage: `breezr ssr:render [options] <file>`,
    description: 'get ssr result',
    options: {
      '--config': 'console config 的 json 文件',
      '--path': '要渲染的路由'
    }
  }, (args) => {
    console.log(args);
    let config = {};
    if (args.config) {
      config = require(args.config);
    }
    const code = fs.readFileSync(args._[1], 'UTF-8');
    const tmpPath = path.join(process.cwd(), `node_modules/${Date.now().toString()}.js`);
    fs.writeFileSync(tmpPath, `
var window = {}; var navigator = {};
window.ALIYUN_CONSOLE_CONFIG = ${JSON.stringify(config)}
var location = window.location = {
  search: '',
  hostname: 'foo.bar.com'
};\n${code}`);
    const entry = require(tmpPath);
    const content = entry.default({ location: args.path });
    console.log(content);
  });

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
    res.write(e.toString());
    res.write(e.stack);
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
