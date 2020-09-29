/**
 * sass loader 的 插件
 */
import * as path from 'path';
import * as autoprefixer from 'autoprefixer';
import { PluginAPI } from '@alicloud/console-toolkit-core'
import * as webpack from 'webpack';
import * as Chain from 'webpack-chain';

type CssModules = boolean | 'global' | 'local';

interface BreezrStyleOptions {
  cwd: string;
  modules?: CssModules;
  shouldExtract: boolean;
  cssPublicPath?: string;
  loader?: string;
  classNamePrefix?: string;
  loaderOptions?: any;
  sourceMap?: boolean;
  hasPostCSSConfig?: boolean;
}

function applyCssLoaders(rule: Chain.Rule, options: BreezrStyleOptions) {
  const {
    shouldExtract,
    loader,
    loaderOptions,
    modules = false,
    sourceMap = false,
  } = options;

  // extract-text-webpack-plugin 在 webpack 4 中用作提取 css 的时候存在问题
  // 使用 mini-css-extract-plugin 作为更好的代替方案进行 css 的抽取
  const styleLoaderOptions = {};

  if (shouldExtract) {
    rule
      .use('extract-css-loader')
      .loader(require('mini-css-extract-plugin').loader)
      .options({
        ...styleLoaderOptions,
        publicPath: './',
      });
  } else {
    rule
      .use('style-loader')
      .loader(require.resolve('style-loader'))
      .options(styleLoaderOptions);
  }

  const cssOptions = {
    sourceMap,
    importLoaders: 2,
    modules,
  };

  // css loader
  rule
    .use('css-loader')
    .loader('css-loader')
    .options(cssOptions);

  // postcss loader
  rule
    .use('postcss-loader')
    .loader('postcss-loader')
    .options({
      ident: 'postcss',
      plugins: () => [
        autoprefixer({
          // @ts-ignore
          overrideBrowserslist: [
            '> 0%',
            'not ie <= 9',
          ],
        }),
      ],
    });

  // style loader, eg: less, scss
  if (loader) {
    rule
      .use(loader)
      .loader(loader)
      .options(loaderOptions);
  }
}

function createRules(config: Chain, { lang, test }: {
  lang: string,
  test: webpack.Condition
}) {
  return config.module.rule(lang).test(test);
}

module.exports = (api: PluginAPI) => {
  api.on('onChainWebpack', async (config: Chain, env: any) => {
    function createCssRules(lang: string, test: webpack.Condition, styleOptions: BreezrStyleOptions) {
      const baseRule = createRules(config, { lang, test });
      applyCssLoaders(baseRule, { ...styleOptions });
    }

    const loaderOption = {
      cwd: api.getCwd(),
      loader: 'fast-sass-loader',
      loaderOptions: {
        includePaths: [
          path.resolve(__dirname, '../node_modules'),
        ],
      },
      // 只有在构建的时候才抽取样式
      shouldExtract: env.isProd(),
    };

    createCssRules('sass', { test: /\.sass$/ }, loaderOption);
    createCssRules('scss', { test: /\.scss$/ }, loaderOption);
  });
};