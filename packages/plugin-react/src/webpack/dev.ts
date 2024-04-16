import * as Chain from 'webpack-chain';
import { getEnv } from '@alicloud/console-toolkit-shared-utils';

import { definePlugin } from './plugins/define';
import { openBrowserPlugin } from './plugins/openBrowser';
import { hmrPlugin } from './plugins/hmr';
import { reactRefreshPlugin } from './plugins/reactRefresh';
import { common } from './common';

import { BreezrReactOptions } from '../types';

import { PluginAPI } from '@alicloud/console-toolkit-core';

const NODE_ENV = 'development';

export const dev = (config: Chain, options: BreezrReactOptions, api: PluginAPI) => {
  const {
    port = 3333,
    host = 'localhost',
    https = false,
    defineGlobalConstants,
    noOpen,
    disableHmr = false,
    publicPathOnDev = true,
    reactRefresh
  } = options;

  config.mode(NODE_ENV);

  config.devtool('cheap-module-eval-source-map');

  // set common config
  const disableExtractText = options.disableExtractText !== undefined
    ? options.disableExtractText
    : getEnv().isDev();

  common(config, {
    ...options,
    disableExtractText,
  }, api);

  definePlugin(config, {
    'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    ...defineGlobalConstants
  });

  /**
   * dynamicBundle, bundleAnalyzer
   */
  const protocol = https ? 'https' : 'http';
  const url = `${protocol}://${host}:${port}`;
  if (!noOpen) {
    openBrowserPlugin(config, { url: url });
  }

  if (publicPathOnDev) {
    config.output.publicPath(`//${host}:${port}/`);
  }

  if (!disableHmr) {
    hmrPlugin(config);
  }


  if (reactRefresh) {
    reactRefreshPlugin(config, options)
  }

  chainDevServer(config, options);
};

function chainDevServer(config: Chain, options: BreezrReactOptions) {
  const {
    port = 3333,
    host = 'localhost',
    https = false,
    disableHmr,
  } = options;

  config
    .devServer
    .stats('errors-only')
    .headers({
      'Access-Control-Allow-Origin': '*',
    })
    .disableHostCheck(true)
    .port(port)
    .host(host)
    .https(https)
    .hot(!disableHmr)
    .inline(!disableHmr)
    .historyApiFallback({
      rewrites: [
        {
          from: /^(?!\/build|)/,
          to: 'index.html',
        },
      ]
    })
    .end();
}
