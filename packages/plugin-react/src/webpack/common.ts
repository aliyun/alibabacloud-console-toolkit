import { resolve } from 'path';

import * as Chain from 'webpack-chain';
import { getEnv, error, exit } from '@alicloud/console-toolkit-shared-utils';
import { PluginAPI } from '@alicloud/console-toolkit-core';

import { file, jsx, style } from './rules';
import { htmlPlugin } from './plugins/html';
import { progressPlugin } from './plugins/progress';
import { skeletonPlugin } from './plugins/skeleton';
import { analyzerPlugin } from './plugins/analyzer';
import { htmlInjectPlugin } from './plugins/htmlInject';
import { BreezrReactOptions, CssConditionType } from '../types';
import { momentPlugin } from './plugins/moment';

const defaultOptions = {
  cwd: process.cwd(),
  // 入口文件
  entry: './index.js',
  output: {
    filename: '[name].js',
    // 输出的打包文件
    path: 'build',
    // 项目输出路径
    publicPath: '/',
    // 对于热替换(HMR)是必须的，让 webpack 知道在哪里载入热更新的模块(chunk)
    chunkFilename: '[name].js',
  },

  disableBabelLoaderCache: true,
  disableReactHotLoader: false,
  htmlXmlMode: false,
  disableExtractText: false,
  useLegacyCssModules: false,
  babelPluginWindCherryPick: true,

  analyze: false,

  bail: false,
  status: {
    children: false
  },
};

const isRelativePath = (path: string) => /^[.a-zA-Z0-9]/i.test(path);

export const common = (config: Chain, options: BreezrReactOptions = defaultOptions, api: PluginAPI) => {
  const {
    cwd,
    entry = './index.js',
    output: userOutput,
    bail,
    status,
    disableReactHotLoader,
    babelExclude,
    babelPluginWindRc,
    babelPluginWindIntl,
    babelUseBuiltIns,
    disableExtractText,
    noProgress,
    disableHtml,
    disablePolyfill,
    experiment,
    htmlFileName,
    useLegacyCssModules,
    condition: cssCondition,
    theme,
    classNamePrefix,
    babelPluginWindCherryPick,
    babel,
    htmlXmlMode,
    babelOption,
    analyze = false,
    useHappyPack = true,
    hashPrefix = '',
    htmInject = true,
    disableAutoPrefixer = false,
    es5ImcompatibleVersions = false,
    es5IncompatibleVersions = false,
    moment,
    reactRefresh,
    postCssPlugins,
    disableImportXConsoleCSS = false,
    consoleOS,
    disableConsoleOS,
    appId,
  } = options;

  if (!cwd) {
    error('can\'t not get cwd for webpack');
    exit(1);
    return;
  }

  const src = resolve(cwd, 'src');
  // output
  const output = {
    ...defaultOptions.output,
    ...userOutput
  };
  const outputPath = isRelativePath(output.path) ? resolve(cwd, output.path) : output.path;

  if (!disablePolyfill) {
    config
      .entry('index')
      .add(require.resolve('core-js'));
  }

  // entry
  config
    .context(src)
    .entry('index')
    .add(entry)
    .end()
    .output
    .filename(output.filename)
    .path(outputPath)
    .publicPath(output.publicPath)
    .chunkFilename(output.chunkFilename)
    .end();

  config.resolve
    .extensions
    .merge(['.js', '.jsx']);
  
  // rules
  jsx(config, {
    babel,
    reactHotLoader: !disableReactHotLoader,
    reactCssModules: true,
    reactCssModulesContext: src,
    useHappyPack: useHappyPack,
    // 只有在构建的时候才开启转义，否则 .mjs 被转义后，会导致 ReactHotLoader 中兼容 esModule 的方法失效，抛出异常：module is not defined
    es5ImcompatibleVersions: getEnv().isProd() && es5ImcompatibleVersions || es5IncompatibleVersions,
    exclude: babelExclude,
    windRc: babelPluginWindRc,
    useBuiltIns: babelUseBuiltIns,
    windIntl: babelPluginWindIntl,
    windCherryPick: babelPluginWindCherryPick,
    babelOption: babelOption,
    reactRefresh,
  });

  let condition: CssConditionType = 'stable';
  if (useLegacyCssModules) {
    condition = 'legacy';
  } else if (cssCondition) {
    condition = cssCondition;
  }
  style(config, {
    cwd,
    shouldExtract: !disableExtractText,
    condition,
    theme,
    hashPrefix,
    disableAutoPrefixer,
    classNamePrefix,
    postCssPlugins,
    consoleOS,
    disableConsoleOS,
    appId,
  });

  file(config, options);

  // plugins
  if (!disableHtml) {
    const htmlData = api.dispatchSync('getHtmlData');

    htmlPlugin(config, {
      minify: { // 压缩HTML文件
        removeComments: true, // 移除HTML中的注释
        minifyCSS: true// 压缩内联css
      },
      template: htmlFileName ? htmlFileName : resolve(cwd, 'src/index.html'),
      inject: htmInject,
      scriptLoading: options.htmlScriptLoading ? options.htmlScriptLoading : 'block',
      // @ts-ignore
      templateParameters: (compilation, assets, assetTags, options) => {
        return {
          compilation,
          webpackConfig: compilation.options,
          htmlWebpackPlugin: {
            tags: assetTags,
            files: assets,
            options,
          },
          __dev__: getEnv().isDev()
        };
      },
    });
    htmlInjectPlugin(config, {
      data: htmlData,
      htmlXmlMode,
    });
  }
  
  if (analyze && !getEnv().isCloudBuild()) {
    analyzerPlugin(config);
  }

  if (!disableHtml && experiment && experiment.skeleton) {
    skeletonPlugin(config, experiment.skeleton);
  }

  if (!noProgress) {
    progressPlugin(config);
  }

  // others
  if (status) {
    config.stats(status);
  }
  
  if (bail) {
    config.bail(bail);
  }

  if (!moment?.disable) {
    momentPlugin(config);
  }

  if (disableImportXConsoleCSS) {
    config.resolve.alias
      .set('@alicloud/console-components/dist/xconsole.css', require.resolve('../../tpl/empty.css'))
      .set('@alicloud/console-components/dist/xconsole-dark-var.css', require.resolve('../../tpl/empty.css'))
      .set('@alicloud/console-components/dist/xconsole-dark-var-rc.css', require.resolve('../../tpl/empty.css'))
      .set('@alicloud/console-components/dist/xconsole-var-rc.css', require.resolve('../../tpl/empty.css'));
  }
};