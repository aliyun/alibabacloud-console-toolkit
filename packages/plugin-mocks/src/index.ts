import chalk from 'chalk';
import * as Chain from 'webpack-chain';
import { Request, Application } from 'express';
import { mapValues, isPlainObject, merge } from 'lodash';
import * as bodyParser from 'body-parser';
import { PluginAPI, PluginOptions } from "@alicloud/console-toolkit-core";
import { Evnrioment, BuildType } from '@alicloud/console-toolkit-shared-utils';
import * as url from 'url';
import * as qs from 'querystring';

export default (api: PluginAPI, opts: PluginOptions) => {
  const {
    oneapi = false
  } = opts;

  api.on('onChainWebpack', async (config: Chain, env: Evnrioment) => {
    const {
      product,
      oneConsoleProductAlias,
      uriMatch = '/api/**/*.json',
      pathReplace = [],
      proxy,
    } = opts;

    let host = opts.host || 'http://mocks.alibaba-inc.com';
    host =  oneapi ? 'http://oneapi.alibaba-inc.com' : host;

    if (env.buildType & BuildType.Prod) {
      return;
    }

    const defaultMatch = '^\\/api\\/';
    const defaultReplaceWith = `/mock/${product}`;

    let match = '';
    let replaceWith = defaultReplaceWith;

    if (typeof pathReplace === 'string') {
      match = defaultMatch;
      replaceWith = pathReplace;
    }

    if (Array.isArray(pathReplace)) {
      const [confMatch, confReplaceWith] = pathReplace;
      match = confMatch || defaultMatch;
      replaceWith = confReplaceWith || defaultReplaceWith;
    }

    let pathRewrite;
    if (match && replaceWith) {
      pathRewrite = (path: string) => path.replace(new RegExp(match), replaceWith);
    }

    const log = (onProxyReq: Function) => (proxyReq: any, req: Request) => {
      try {
        onProxyReq(proxyReq, req);
        console.warn(
          `[${chalk.green('Proxy')}] ` +
          `${chalk.cyan.bold(proxyReq.method)} ` +
          `${req.url} ` +
          `${chalk.yellow('-->')} ` +
          `${proxyReq.agent.protocol}//${proxyReq.socket._host}:${proxyReq.agent.defaultPort}${proxyReq.path}`
        );
      } catch (err) {
        console.error(
          `[${chalk.red('ProxyError')}] ${chalk.yellow(err.message)}`
        );
        console.error(
          chalk.yellow(err.stack)
        );
      }
    };

    const baseOnProxyReq = log((proxyReq: any, req: Request) => {
      if (req.body) {
        const proxyBodyData = JSON.stringify(
          req.body
        );

        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader(
          'Content-Length',
          Buffer.byteLength(proxyBodyData)
        );
        proxyReq.write(proxyBodyData);
      }
    });

    const oneConsoleProxyReq = log((proxyReq: any, req: Request) => {
      if (req.body) {
        const { product: oneConsoleProduct } = req.body;
        const body: any = {};
        
        /**
         * 在 path rewrite 的时候 会将 
         */
        const uri = url.parse(proxyReq.path);
        if (uri.query) {
          const query = qs.parse(uri.query);
          req.body.action = `${query.type}/${req.body.action}`;
        }

        if (
          oneConsoleProduct &&
          oneConsoleProductAlias &&
          oneConsoleProductAlias[oneConsoleProduct]
        ) {
          body.product = oneConsoleProductAlias[oneConsoleProduct];
        }

        const proxyBodyData = JSON.stringify(
          Object.assign(req.body, body)
        );

        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader(
          'Content-Length',
          Buffer.byteLength(proxyBodyData)
        );
        proxyReq.write(proxyBodyData);
      }
    });

    const commonProxyConfig = {
      secure: false,
      changeOrigin: true,
      onProxyReq: baseOnProxyReq,
    };

    const customProxy = isPlainObject(proxy) ?
      mapValues(proxy, (val: string) => merge({}, commonProxyConfig, {
        target: host,
      }, val)) : {};

    const productProxy = (typeof product === 'string' || oneapi) ? {
      // Proxy as Portal
      // e.g.:
      // /api/vpc/DescribeVpcs.json
      // will proxy to
      // http://mocks.test.com/mock/${product}/vpc/DescribeVpcs.json
      [uriMatch]: merge({}, commonProxyConfig, {
        target: host,
        pathRewrite,
      }),

      '/data/(innerApi|call).json': merge({}, commonProxyConfig, {
        /**
         * /data/innerApi.json?action=A  =>  /data/api.json?type=innerApi&action=A
         * /data/call.json?action=A  =>  /data/api.json?type=innerApi&action=A
         */
        target: host,
        pathRewrite: (path: string) => path.replace(
          /^\/data\/(innerApi|call)\.json(\?(.*))?/,
          '/mock/oneconsole/data/api.json$2&type=$1'
        ),
        onProxyReq: oneConsoleProxyReq,
      }),

      // Proxy as OneConsole
      '/data/*.json': merge({}, commonProxyConfig, {
        target: host,
        pathRewrite: (path: string) => {
          return path.replace(
            /^\/data\/(.*)\.json/,
            '/mock/oneconsole/data/$1.json'
          ).replace(/\?_fetcher_=.*/, '')
        },
        onProxyReq: oneConsoleProxyReq,
      }),

      // Proxy risk/sendVerifyCode
      '/risk/sendVerifyMessage.json': merge({}, commonProxyConfig, {
        target: host,
        pathRewrite: (path: string) => `/mock/${product}${path}`,
      }),

      // Proxy tool/**/*.json
      '/tool/**/*.json': merge({}, commonProxyConfig, {
        target: host,
        pathRewrite: (path: string) => `/mock/${product}${path}`,
      }),
    } : {};

    const mocksProxyConfig = {
      devServer: {
        before(app: Application) {
          app.use(bodyParser.urlencoded({ extended: false }));
          app.use(bodyParser.json());
        },

        proxy: Object.assign({}, productProxy, customProxy),
      },
    };

    config.merge(mocksProxyConfig);
  });
};