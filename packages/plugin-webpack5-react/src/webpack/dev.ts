import * as Chain from '@gem-mine/webpack-chain';
import { getEnv } from '@alicloud/console-toolkit-shared-utils';

import { definePlugin } from './plugins/define';
import { openBrowser } from './plugins/openBrowser';
import { reactRefreshPlugin } from './plugins/reactRefresh';
import { common } from './common';

import { BreezrReactOptions } from '../types';

import { PluginAPI } from '@alicloud/console-toolkit-core';

const NODE_ENV = 'development';

function chainDevServer(config: Chain, options: BreezrReactOptions) {
  const {
    port = 3333,
    host = 'localhost',
    https = false,
    disableHmr,
  } = options;

  config.devServer.allowedHosts.add('all');

  /**
   * https://github.com/webpack/webpack/issues/11612#issuecomment-705790881
   * By default, webpack assumes that the node_modules directory,
   * which webpack is inside of, is only modified by a package manager.
   * Hashing and timeStamping is skipped for node_modules.
   * Instead, only the package name and version is used for performance reasons.
   * Symlinks (i. e. npm/yarn link) are fine.
   * Do not edit files in node_modules directly unless you opt-out of this optimization with snapshot.managedPaths: [].
   * When using Yarn PnP webpack assumes that the yarn cache is immutable (which it usually is).
   * You can opt-out of this optimization with snapshot.immutablePaths: []
   *
   * 避免 webpack 将 node_modules 缓存，导致修改 node_modules 内的包代码不生效
   */
  config.snapshot({
    managedPaths: [],
    immutablePaths: [],
  })

  config
    .stats('errors-only')
    .devServer
    .headers({
      'Access-Control-Allow-Origin': '*',
    })
    .port(port)
    .host(host)
    .set(
      'server',
      https === true
        ? 'https'
        : https === false
          ? 'http'
          : {
            type: 'https',
            options: https,
          }
    )
    .https(https)
    .hot(!disableHmr)
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
    https,
    defineGlobalConstants,
    noOpen,
    publicPathOnDev = true,
    reactRefresh = true,
    disableErrorOverlay,
  } = options;

  config.mode(NODE_ENV);

  // @ts-ignore
  config.devtool('eval-cheap-module-source-map');

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
    openBrowser(config, { url: url });
  }

  if (publicPathOnDev) {
    config.output.publicPath(`${protocol}://${host}:${port}/`);
  }

  if (disableErrorOverlay) {
    config.devServer.client.merge({ overlay: false });
  }

  if (reactRefresh) {
    reactRefreshPlugin(config, options)
  }

  chainDevServer(config, options);
};
