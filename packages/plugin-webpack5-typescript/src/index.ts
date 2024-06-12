import { resolve } from 'path';
import { existsSync } from 'fs';
import * as WebpackChain from '@gem-mine/webpack-chain';
import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';
import { warn } from '@alicloud/console-toolkit-shared-utils';
import * as IgnoreNotFoundExportPlugin from "ignore-not-found-export-webpack-plugin";

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

interface ILoader {
  loader: string;
  options: WebpackChain.LoaderOptions;
}

const getBabelOption = (opts: PluginOptions) => {
  const {
    typescript = { useBabel: true },
    babelPluginWindCherryPick,
    babelExclude,
    babelPluginWindRc,
    babelPluginWindIntl,
    reactRefresh,
  } = opts;
  return {
    presets: [
      [
        require.resolve('@alicloud/babel-preset-xconsole'), {
          exclude: babelExclude,
          reactCssModules: typescript.reactCssModules === undefined ? true: typescript.reactCssModules,
          windRc: babelPluginWindRc,
          windIntl: babelPluginWindIntl,
          windCherryPick: babelPluginWindCherryPick,
          reactRefresh,
          typescript: true,
          presetEnv: opts.presetEnv,
        }
      ]
    ],
  };
}

export default (api: PluginAPI, opts: PluginOptions) => {
  const {
    tsconfig = resolve(api.getCwd(), 'tsconfig.json'),
    ignoreWebpackModuleDependencyWarning,
    typescript = { useBabel: true },
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
        .prepend(require.resolve('core-js'));
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
      const babelOption = opts.babelOption ? opts.babelOption : getBabelOption(opts);

      addLoader({
        loader: require.resolve('babel-loader'),
        options: babelOption,
      });
    }

    if (!typescript.disableTypeChecker) {
      config
        .plugin('ForkTsCheckerWebpackPlugin')
        .use(ForkTsCheckerWebpackPlugin, [{
          typescript: {
            memoryLimit: 4089,
            configFile: tsconfig,
          }
        }]);
    }
  });
};

