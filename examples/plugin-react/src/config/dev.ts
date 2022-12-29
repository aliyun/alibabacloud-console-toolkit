import { IContext } from '@alicloud/console-toolkit-core';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

import getCommonConfig from './common.js';
import type { IConfig } from '../type';

const getDevConfig = (context: IContext, config: IConfig) => {
  const commonConfig = getCommonConfig(context, {
    ...config,
    devServer: {
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
      },
      // proxy,
      hot: true,
      compress: true,
      webSocketServer: 'ws',
      // devMiddleware: {
      //   publicPath,
      // },
      // static: {
      //   watch: {
      //     ignored: watchIgnoredRegexp,
      //   },
      // },
      client: {
        overlay: true,
        logging: 'info',
      },
      // setupMiddlewares: middlewares,
      https: false,
    },
  });

  commonConfig.plugins?.push(new ReactRefreshWebpackPlugin({
    exclude: [/node_modules/, /bundles[\\\\/]compiled/],
    // use webpack-dev-server overlay instead
    overlay: false,
  }));

  return commonConfig;
};

export default getDevConfig;
