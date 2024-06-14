import * as path from 'path';
import * as Chain from '@gem-mine/webpack-chain';
import * as webpackMerge from 'webpack-merge';
import * as webpack from 'webpack';
import * as webpackDevServer from 'webpack-dev-server';
import { debug, isDev, error, warn } from '@alicloud/console-toolkit-shared-utils';
import { PluginAPI } from '@alicloud/console-toolkit-core';
import { PluginAPIOpt } from './type';
import { HOST, PORT } from './constants';

type Signals = 'SIGINT' | 'SIGTERM';

export function runCompiler(
  compiler: webpack.Compiler,
  watch: boolean = false
) {
  return new Promise<webpack.Stats | undefined>((resolve, reject) => {
    function handleStats(stats: webpack.Stats | undefined) {
      if (!stats) {
        return;
      }
      const info = stats.toJson({
        // toJson options
      });

      if (stats.hasErrors()) {
        // @ts-ignore
        info.errors?.forEach((e) => {
          const E = new Error(e.file);
          E.stack = e.message;

          error(E.stack ? E : e as Error);
        });
        reject(info.errors);
      }

      if (stats.hasWarnings()) {
        // @ts-ignore
        info.warnings?.forEach((msg) => {
          warn(msg?.message);
        });
      }
    }

    if (watch) {
      compiler.watch(
        {
          // watching options
        },
        (err, stats) => {
          if (err) {
            error(err);
            return reject(err);
          }
          handleStats(stats);
          resolve(stats);
        }
      );
    } else {
      compiler.run((err, stats) => {
        if (err) {
          error(err);
          return reject(err);
        }
        handleStats(stats);
        resolve(stats);

        compiler.close(() => {});
      });
    }
  });
}

export function createChain(dir: string): Chain {
  /**
   * local config of webpack
   */
  const chain = new Chain();

  /**
   * default config, include context, entry, output and mode.
   */
  chain
    .context(dir)
    .entry('index')
    .add('src/index.js')
    .end()
    .output.path(path.resolve(dir, 'dist'))
    .filename('[name].bundle.js')
    .end()
    .mode('production') // production env as default
    .when(isDev, config => {
      config.mode('development');
    })
    .resolve.fallback.merge({
      assert: require.resolve('assert'),
      buffer: require.resolve('buffer'),
      console: require.resolve('console-browserify'),
      constants: require.resolve('constants-browserify'),
      crypto: require.resolve('crypto-browserify'),
      domain: require.resolve('domain-browser'),
      events: require.resolve('events'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      punycode: require.resolve('punycode'),
      process: require.resolve('process/browser'),
      querystring: require.resolve('querystring-es3'),
      stream: require.resolve('stream-browserify'),
      string_decoder: require.resolve('string_decoder'),
      sys: require.resolve('util'),
      timers: require.resolve('timers-browserify'),
      tty: require.resolve('tty-browserify'),
      url: require.resolve('url'),
      util: require.resolve('util'),
      vm: require.resolve('vm-browserify'),
      zlib: require.resolve('browserify-zlib'),
    });

  debug('engine', 'default webpack config: %s', chain.toString());

  return chain;
}
/**
 * integrate with user config.
 * @param api
 * @param opts
 * @param chain?
 * @return Chain
 */
export function webpackConfigure(
  api: PluginAPI,
  opts: PluginAPIOpt,
  chain?: Chain
): webpack.Configuration {
  let _chain = chain;

  const currrentDir = api.getCwd();

  if (!_chain) {
    _chain = createChain(currrentDir); // get default config
  }

  const directory = opts.directory || currrentDir;
  const filename = opts.filename || 'webpack.config.js';
  let configByUser = opts.config || null; // get user config

  /**
   * Get user config according to path, if user did not pass the config.
   */
  if (!configByUser) {
    configByUser = require(path.resolve(directory, filename));
  }

  if (configByUser.entry) {
    /**
     * delete default entry
     */
    _chain.entryPoints.clear();

    /**
     * format entry from String to Object, needed by webpack-chain, too.
     */
    if (typeof configByUser.entry === 'string') {
      configByUser.entry = {
        index: configByUser.entry
      };
    }
  }

  // @ts-ignore
  return webpackMerge.merge(_chain.toConfig(), configByUser);
  // _chain.merge(configByUser);

  // return _chain;
}

export function createServer(
  compiler: webpack.Compiler,
  devServerConfig: webpackDevServer.Configuration
): webpackDevServer {
  let server;
  // @ts-ignore
  server = new webpackDevServer(devServerConfig, compiler);

  return server;
}

export function runServer(
  server: webpackDevServer,
  devServerConfig: webpackDevServer.Configuration
) {
  return new Promise<webpack.Stats | void>((resolve, reject) => {
    const { host = HOST, port = PORT } = devServerConfig;
    debug('engine', `current devServer listening: ${host}:${port}`);

    ['SIGINT', 'SIGTERM'].forEach((signal: string) => {
      process.on(signal as Signals, () => {
        server.stop().then(() => {
          process.exit();
        });
      });
    });

    server.listen(port, host, err => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

export function createCompiler(
  config: webpack.Configuration
): webpack.Compiler {
  let compiler;
  compiler = webpack(config);

  return compiler;
}
