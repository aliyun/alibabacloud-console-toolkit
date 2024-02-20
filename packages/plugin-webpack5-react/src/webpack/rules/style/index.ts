import * as autoprefixer from 'autoprefixer';
import * as Chain from '@gem-mine/webpack-chain';
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
    hashPrefix = '',
    disableAutoPrefixer = false,
    postCssPlugins = [],
  } = options;

  // extract-text-webpack-plugin 在 webpack 4 中用作提取 css 的时候存在问题
  // 使用 mini-css-extract-plugin 作为更好的代替方案进行 css 的抽取
  const styleLoaderOptions = classNamePrefix ? {
    injectType: 'singletonStyleTag',
    attributes: {
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
        publicPath: 'auto',
        esModule: false,
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
      modules: {
        localIdentName: `${classNamePrefix ? classNamePrefix : "[path]"}___[name]__[local]___[hash:base64:5]`,
      }
    };

    if (hashPrefix) cssOptions.modules.localIdentHashSalt = hashPrefix;
  }

  // css loader
  rule
    .use('css-loader')
    .loader(require.resolve('css-loader'))
    .options(cssOptions);

  // postcss loader
  if (!disableAutoPrefixer) {
    postCssPlugins.push(autoprefixer({
      overrideBrowserslist: [
        '> 0%',
        'not ie <= 9',
      ],
    }))
  }

  rule
    .use('postcss-loader')
    .loader(require.resolve('postcss-loader'))
    .options({
      postcssOptions: {
        plugins: [...postCssPlugins]
      }
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
    consoleOS,
    disableConsoleOS,
  } = options;

  const {
    disableOsCssExtends,
  } = consoleOS || {};

  function createCssRules(lang: string, condition: webpack.RuleSetRule, styleOptions?: {
    loader?: string;
    loaderOptions?: Chain.LoaderOptions;
    modules?: CssModules;
  }) {
    const baseRule = createRules(config, { lang, ...condition });

    applyCssLoaders(baseRule, {
      ...options,
      ...styleOptions,
    });
  }

  const lessLoaderOptions = {
    lessOptions: {
      javascriptEnabled: true,
      modifyVars: options.theme ? normalizeTheme(options.theme, {cwd}) : {}
    }
  };

  createCssRules('css', { test: /\.css$/ });

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
        // 针对沙箱场景替换 async chunk 的文件名
        // 必须是没有关闭微应用构建且没关闭构建 .os.css 文件
        insert: (!disableConsoleOS && !disableOsCssExtends) ? (linkTag: HTMLLinkElement) => {
          let isConsoleOS = false;

          try {
            // context maybe not defined
            // @ts-ignore
            isConsoleOS = !!context.__IS_CONSOLE_OS_CONTEXT__ && window !== window.parent;
          } catch (e) {
              // ...
          }
          if (isConsoleOS) linkTag.href = linkTag.href.replace('.css', '.os.css');

          document.head.appendChild(linkTag);
        } : undefined,
      }]);
  }
};
