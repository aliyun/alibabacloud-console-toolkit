import { resolve } from 'path';
import { existsSync } from 'fs';
import * as WebpackChain from 'webpack-chain';
import * as ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';
import { warn } from '@alicloud/console-toolkit-shared-utils';
import * as IgnoreNotFoundExportPlugin from "ignore-not-found-export-webpack-plugin";

interface ILoader {
  loader: string;
  options: WebpackChain.LoaderOptions;
}

export default (api: PluginAPI, opts: PluginOptions) => {
  const {
    tsconfig = resolve(api.getCwd(), 'tsconfig.json'),
    ignoreWebpackModuleDependencyWarning,
    typescript = {},
    babelPluginWindCherryPick,
    babelExclude,
    babelPluginWindRc,
    babelPluginWindIntl
  } = opts;

  api.on('onChainWebpack', async (config: WebpackChain) => {
    config
      .entry('index')
      .clear()
      .add('./index')
      .end()
      .resolve
      .extensions
      .merge(['.js', '.jsx', '.ts', '.tsx'])
      .end();
    
    if (!opts.disablePolyfill) {
      config
        .entry('index')
        .prepend(require.resolve('babel-polyfill'));
    }

    if (!tsconfig || !existsSync(tsconfig)) {
      warn(
        `Cannot find typescript config file: ${tsconfig}\n` +
        'The (.ts|.tsx) files will not be resolved.'
      );
    }
    if (ignoreWebpackModuleDependencyWarning) {
      config
        .plugin('ignoreWebpackModuleDependencyWarning')
        .use(IgnoreNotFoundExportPlugin, [[new RegExp(`^${resolve(api.getCwd(), 'src')}.*\\.tsx?$`)]]);
    }

    const tsRule = config
      .module
      .rule('ts')
      .test(/\.tsx?$/);

    tsRule
      .exclude
      .add(/node_modules/)
      .end();

    const addLoader = ({ loader, options }: ILoader) => {
      return tsRule.use(loader).loader(loader).options(options);
    };

    if (!typescript.useBabel){
      addLoader({
        loader: require.resolve('cache-loader'),
        options: {}
      });
  
      addLoader({
        loader: require.resolve('thread-loader'),
        options: {
          workers: require('os').cpus().length - 1,
        }
      });
  
      addLoader({
        loader: require.resolve('ts-loader'),
        options: {
          configFile: tsconfig,
          happyPackMode: true
        }
      });
    } else {
      addLoader({
        loader: require.resolve('babel-loader'),
        options: {
          presets: [
            [
              require.resolve('babel-preset-breezr-wind'), {
                exclude: babelExclude,
                reactCssModules: true,
                windRc: babelPluginWindRc,
                windIntl: babelPluginWindIntl,
                windCherryPick: babelPluginWindCherryPick
              }
            ]
          ],
          plugins: [
            [
              require.resolve('@babel/plugin-transform-typescript'),
              {
                isTSX :true
              }
            ]
          ]
        }
      });
    }

    const tslintConf = resolve(api.getCwd(), 'tslint.json');
    const disableTsLint = !existsSync(tslintConf);
    const { eslint } = opts;
    config
      .plugin('ForkTsCheckerWebpackPlugin')
      .use(ForkTsCheckerWebpackPlugin, [{
        tsconfig,
        eslint,
        // active when eslint is false or no tslint.json
        tslint: !eslint && disableTsLint ? undefined: tslintConf
      }]);
  });
};

