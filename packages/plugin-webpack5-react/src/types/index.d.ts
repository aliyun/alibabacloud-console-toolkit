import * as Webpack from 'webpack';
import * as https from 'https';

type CssConditionType = 'legacy' | 'stable' | 'widget';

interface BreezrReactOptions {
  port?: number;
  host?: string;
  https?: boolean | https.ServerOptions;
  publicPathOnDev?: string;

  cwd?: string;

  // webpack 配置
  entry?: string;
  context?: any;
  output?: {
    filename: string;
    path: string;
    publicPath: string;
    chunkFilename: string;
  };
  bail?: boolean;
  status?: {
    children: boolean;
  };
  sourceMap?: boolean;

  // style 配置
  useLegacyCssModules?: boolean;
  condition?: CssConditionType;
  classNamePrefix?: string;
  hashPrefix?: string;
  theme?: string | ThemeDef;
  disableAutoPrefixer?: boolean;
  postCssPlugins?: any[];
  disableImportXConsoleCSS?: boolean;
  useSass?: boolean;
  tailwindcss?: any;

  // babel-loader 配置
  babel?: Function;
  babelOption?: any;
  disableHmr?: boolean;
  disableExtractText?: boolean;
  disableUglify?: boolean;
  disableReactHotLoader?: boolean;
  babelInclude?: Webpack.RuleSetCondition;
  babelExclude?: Webpack.RuleSetCondition;
  babelPluginWindRc?: boolean;
  babelUseBuiltIns?: boolean;
  babelPluginWindIntl?: boolean;
  babelPluginWindCherryPick?: boolean;
  useThreads?: boolean;
  // useHappyPack?: boolean; 废弃

  // 拼写错误，为了兼容一起的
  es5ImcompatibleVersions?: boolean;
  es5IncompatibleVersions?: boolean;
  reactRefresh?: boolean;

  /**
   * @deprecated
   */
  // file-loader 配置
  staticAssetsOutputPath?: string;
  staticAssetsFileRule?: RegExp;
  staticAssetsBase64Limit?: number;
  staticAssetsOutputName?: string;

  javascriptEnabled?: boolean;

  // plugins 配置
  defineGlobalConstants?: {
    [key: string]: any;
  };
  htmlFileName?: string;
  disableErrorOverlay?: boolean;
  disableHtml?: false;
  noProgress?: boolean;
  noOpen?: false;
  uglifyOptions?: any;
  htmlXmlMode?: boolean;
  htmInject?: boolean;
  htmlScriptLoading?: 'defer' | 'block' | 'module';
  htmlScriptCORS?: boolean;
  htmlScriptPriority?: 'high' | 'low' | 'auto';
  mf?: {
    sharedOS?: [string, string][];
  };

  // experiment
  experiment?: {
    skeleton: boolean;
  };

  // polyfill
  disablePolyfill?: boolean;

  analyze?: boolean;

  moment?: {
    disable: boolean;
  };

  // webpack cache
  enableCache?: boolean;
  cacheDirectory?: string;

  // consoleOS
  appId?: string;
  consoleOS?: {
    cssPrefix?: string;
    disableCssPrefix?: boolean;
    disableOsCssExtends?: boolean;
    enableStandaloneBundle?: boolean;
  };
  disableConsoleOS?: boolean;
}

/**
 * babel 的 options
 */
interface BreezrReactBabelOption {
  // babel 配置
  babel?: Function;
  reactHotLoader?: boolean;
  reactCssModules?: boolean;
  reactCssModulesContext?: string;
  reactCssModulesResolvePath?: string;
  windCherryPick?: boolean;
  useBuiltIns?: boolean;
  windRc?: boolean;
  windIntl?: boolean;
  babelOption?: any;
  es5ImcompatibleVersions?: boolean;
  exclude?: Webpack.RuleSetCondition;
  include?: Webpack.RuleSetCondition;
  reactRefresh?: boolean;
  /**
   * @deprecated
   */
  useHappyPack?: boolean;
}

type CssModules = boolean | 'global' | 'local';

/**
 * style 的 options 类型
 */
interface BreezrStyleOptions extends Pick<BreezrReactOptions, 'appId' | 'consoleOS' | 'disableConsoleOS'> {
  cwd: string;
  theme?: string | ThemeDef;
  modules?: CssModules;
  shouldExtract: boolean;
  cssPublicPath?: string;
  loader?: string;
  classNamePrefix?: string;
  loaderOptions?: any;
  sourceMap?: boolean;
  hashPrefix?: string;
  hasPostCSSConfig?: boolean;
  disableAutoPrefixer?: boolean;
  condition?: CssConditionType;
  postCssPlugins?: any[];
  useSass?: boolean;
  tailwindcss?: {
    config?: string;
  };
}

interface ThemeDef {
  [key: string]: string;
}
