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

const getBabelOption = (opts: PluginOptions) => {
  const {
    reactHotLoader,
    reactRefresh,
    babelPlugins,
  } = opts;

  return {
    presets: [
      [
        require.resolve('@alicloud/babel-preset-xconsole'),
        {
          reactHotLoader,
          reactRefresh
        }
      ]
    ],
    plugins: [
      ...babelPlugins,
    ],
  };
}

export default (api: PluginAPI, opts: PluginOptions) => {
  const {
    tsconfig = resolve(api.getCwd(), 'tsconfig.json'),
    ignoreWebpackModuleDependencyWarning,
    typescript = {}
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
      const babelOption = opts.babelOption ? opts.babelOption : getBabelOption(opts);

      addLoader({
        loader: require.resolve('babel-loader'),
        options: babelOption,
      });
    }

    // const tslintConf = resolve(api.getCwd(), 'tslint.json');
    // const disableTsLint = !existsSync(tslintConf);
    const { eslint } = opts;

    if (!typescript.disableTypeChecker) {
      const defaultConfig = {
        tsconfig,
        eslint,
        memoryLimit: 4089,
      }

      // in high version of ForkTsCheckerWebpackPlugin, tslint is not valid option
      // if (eslint || !disableTsLint) {
      //   // active when eslint is false or no tslint.json
      //   // @ts-ignore
      //   defaultConfig.tslint = tslintConf;
      // }

      config
        .plugin('ForkTsCheckerWebpackPlugin')
        .use(ForkTsCheckerWebpackPlugin, [
          defaultConfig
        ]);
    }
  });
};

