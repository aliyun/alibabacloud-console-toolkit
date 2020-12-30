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
  api.on('onChainWebpack', async (config: Chain, env: Evnrioment) => {
    const {
      oneConsoleProductAlias,
      uriMatch = '/api/**/*.json',
      proxy,
      disableBodyParser = false,
    } = opts;

    const host = 'https://oneapi.alibaba-inc.com/';

    if (env.buildType & BuildType.Prod) {
      return;
    }

    const pathRewrite = (path: string, req: Request) => {
      let product = null;
      let action = null;
      const query = req.query;
      product = query.product;
      action = query.action;

      const { product: oneConsoleProduct } = req.body;

      if (oneConsoleProduct) {
        product = oneConsoleProduct;
      }

      if (
        oneConsoleProduct &&
        oneConsoleProductAlias &&
        oneConsoleProductAlias[oneConsoleProduct]
      ) {
        product = oneConsoleProductAlias[oneConsoleProduct];
      }

      if (req.body.action) {
        action = req.body.action;
      }

      return `/mock/${product}/${action}.json`
    };

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

    const productProxy = {
      // Proxy as Portal
      // e.g.:
      // /api/vpc/DescribeVpcs.json
      // will proxy to
      // http://mocks.alibaba-inc.com/mock/${product}/vpc/DescribeVpcs.json
      [uriMatch]: merge({}, commonProxyConfig, {
        target: host,
        pathRewrite,
      }),

      // Proxy as OneConsole
      '/data/*.json': merge({}, commonProxyConfig, {
        target: host,
        pathRewrite,
        onProxyReq: oneConsoleProxyReq,
      }),
    }

    const mocksProxyConfig = {
      devServer: {
        before(app: Application) {
          if (disableBodyParser) {
            return;
          }
          app.use(bodyParser.urlencoded({ extended: false }));
          app.use(bodyParser.json());
        },

        proxy: Object.assign({}, productProxy, customProxy),
      },
    };

    config.merge(mocksProxyConfig);
  });
};