import * as Chain from 'webpack-chain';
import { getEnv } from '@alicloud/console-toolkit-shared-utils';

import { definePlugin } from './plugins/define';
import { openBrowserPlugin } from './plugins/openBrowser';
import { errorOverlay } from './plugins/errorOverlay';
import { hmrPlugin } from './plugins/hmr';
import { common } from './common';

import { BreezrReactOptions } from '../types';
import { PluginAPI } from '@alicloud/console-toolkit-core';

const NODE_ENV = 'development';


function chainDevServer(config: Chain, options: BreezrReactOptions) {
  const {
    port = 3333,
    host = 'localhost',
    https = false,
    disableHmr
  } = options;

  config
    .devServer
    .stats('errors-only')
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

export const dev = (config: Chain, options: BreezrReactOptions, api: PluginAPI) => {
  const {
    port = 3333,
    host = 'localhost',
    https = false,
    defineGlobalConstants,
    noOpen,
    disableErrorOverlay = false,
    disableHmr = false,
  } = options;

  config.mode(NODE_ENV);

  config.devtool('cheap-module-source-map');

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
  if (!noOpen) {
    const protocol = https ? 'https' : 'http';
    openBrowserPlugin(config, { url: `${protocol}://${host}:${port}` });
  }

  if (!disableHmr) {
    hmrPlugin(config);
  }

  if (!disableErrorOverlay) {
    errorOverlay(config);
  }

  chainDevServer(config, options);
};
