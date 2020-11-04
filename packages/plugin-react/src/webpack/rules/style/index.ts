import * as autoprefixer from 'autoprefixer';
import * as Chain from 'webpack-chain';
import * as webpack from 'webpack';

import { createRules } from '../../../utils';
import { BreezrStyleOptions, CssModules } from '../../../types';
import { getCondtions } from './conditions';
import normalizeTheme from './normalizeTheme';

function applyCssLoaders(rule: Chain.Rule, options: BreezrStyleOptions) {
  const {
    shouldExtract,
    loader,
    loaderOptions,
    modules = false,
    sourceMap = false,
    classNamePrefix,
    hashPrefix = ''
  } = options;

  // extract-text-webpack-plugin 在 webpack 4 中用作提取 css 的时候存在问题
  // 使用 mini-css-extract-plugin 作为更好的代替方案进行 css 的抽取
  const styleLoaderOptions = classNamePrefix? {
    singleton: true,
    attrs: {
      // Add a custom attr to the generated style tag to easily
      // identify which widget the style tag belonging to.
      from: classNamePrefix
    }
  } : {};

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

  let cssOptions: Chain.LoaderOptions = {
    sourceMap,
    importLoaders: 2,
    modules,
  };

  if (modules === true || modules === 'local') {
    cssOptions = {
      ...cssOptions,
      localIdentName: `${classNamePrefix ? classNamePrefix : "[path]"}___[name]__[local]___[hash:base64:5]`,
      hashPrefix: hashPrefix
    };
  }

  // css loader
  rule
    .use('css-loader')
    .loader(require.resolve('css-loader'))
    .options(cssOptions);

  // postcss loader
  rule
    .use('postcss-loader')
    .loader(require.resolve('postcss-loader'))
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
      ]
    });

  // style loader, eg: less, scss
  if (loader) {
    rule
      .use(loader)
      .loader(require.resolve(loader))
      .options(loaderOptions);
  }
}

/**
 *
 * @param config
 * @param options
 */
export const style = (config: Chain, options: BreezrStyleOptions) => {

  const {
    cwd,
    shouldExtract,
    condition = 'stable',
  } = options;
  function createCssRules(lang: string, test: webpack.Condition, styleOptions?: {
    loader?: string,
    loaderOptions?: Chain.LoaderOptions,
    modules?: CssModules
  }) {
    const baseRule = createRules(config, { lang, test });

    applyCssLoaders(baseRule, {
      ...options,
      ...styleOptions
    });
  }

  const lessLoaderOptions = {
    javascriptEnabled: true,
    modifyVars: options.theme ? normalizeTheme(options.theme, {cwd}) : {}
  };

  createCssRules('css', /\.css$/);

  /*
   * 排除掉 scope.less 的 的文件, 以防 less-loader 被加载两次
   */
  const { LessConditionsPreset, ScopedLessConditionsPreset } = getCondtions(cwd);
  const lessCondition = LessConditionsPreset[condition];

  /**
   * 这个地方 由于以前默认的时候 css-loader 0.x 和 1.x 会对 :global 默认转义,
   * 但是在 2.x 之后 需要配置 modules = 'global' 字段. 为了兼容以前的版本 默认开启
   * 对 :global 的处理.
   * @see https://github.com/webpack-contrib/css-loader#modules
   */
  createCssRules('less', lessCondition, {
    loader: 'less-loader',
    loaderOptions: lessLoaderOptions,
    modules: false,
  });

  // scoped.less
  const scopeCondition = ScopedLessConditionsPreset[condition];
  createCssRules('less-scoped', scopeCondition, {
    loader: 'less-loader',
    loaderOptions: lessLoaderOptions,
    modules: true,
  });

  if (shouldExtract) {
    // NOTE there 'extract-css' used by breezr-plugin-long-term-caching
    config.plugin('extract-css')
      .use(require('mini-css-extract-plugin'), [{
        filename: '[name].css',
        chunkFilename: '[id].css',
      }]);
  }
};
