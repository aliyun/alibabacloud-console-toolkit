import { Configuration, RuleSetCondition } from 'webpack';
import { Evnrioment } from '@alicloud/console-toolkit-shared-utils';

interface ThemeDef {
  [key: string]: string;
}

export interface BreezrPresetConfig {
  /**
   * 禁用开发更新提示
   * @type {Boolean}
   * @defaults false
   */
  disableUpdator?: boolean;

  /**
   * 构建输出目录的资源前缀, 本地构建默认 /, 云构建默认你的仓库 cdn 前缀
   * @type {string}
   * @defaults /
   */
  outputPublicPath?: string;
  /**
   * dev-server port
   * @type {Number}
   * @defaults 3333
   */
  port?: string;
  /**
   * dev-server host
   * @type {String}
   * @defaults 'localhost'
   */
  host?: string;
  /**
   * dev-server 启用 https
   * @type {Boolean}
   * @defaults false
   */
  https?: boolean;

  /**
   * 开启 webpack-bundle-analyzer 来分析包大小
   * 可通过 breezr build --analyze 来指定，
   * @type {Boolean}
   * @defaults false
   */
  analyze?: boolean;

  /**
   * 构建文件入口，默认
   */
  entry?: string;

  hashPrefix?: string;

  output?: {
    filename: string;
    path: string;
    publicPath: string,
    chunkFilename: string,
  };


  /**
   * 是否开启构建出 source-map
   * @type { boolean }
   * @defaults {}
   */
  sourceMap?: false;

  /**
   * 是否使用兼容 1.x 版本的 css modules 规则
   * 在 `builder-wind` 中，只有 containers | components | routes 目录
   * 下的 less 文件会进行 css modules 解析
   * 而在 `builder-yip` 中，只针对后缀为 `.scoped.less` 或 `.module.less` 的
   * less 文件进行 css modules 解析
   * 如果你的项目从 `builder-wind` 迁移到了 `breezr` ，并且不希望变更
   * css modules 的解析规则以降低迁移成本，可以将该配置选项置为 true
   * @type {Boolean}
   * @defaults false
   */
  useLegacyCssModules?: boolean;

  /**
   * 构建的 css 
   * @type {String}
   * @defaults ''
   */
  classNamePrefix?: string;

  /**
   * 
   * @type { string | Object }
   * @defaults {}
   * 
   * 配置主题，实际上是配 less 变量。支持对象和字符串两种类型，字符串需要指向一个返回配置的文件。比如：
   *  theme : {
   *    '@primary': '#0070cc'
   *  }
   * 或者指定文件
   * theme: "./theme.js"; // theme.js 导出的是一个 key, value 的对象
   */
  theme?: string | ThemeDef;

  /**
   * 自定义 babel 配置
   */
  babel?: Function;

  /**
   * dev-server 禁用热更新
   * @type {Boolean}
   * @defaults false
   */
  disableHmr?: boolean;

  /**
   * 禁止将 css 抽取为独立的文件
   * @type {Boolean}
   * @defaults false
   */
  disableExtractText?: boolean;

  /**
   * 禁止文件压缩混淆
   * @type {Boolean}
   * @defaults false
   */
  disableUglify?: boolean;

  /**
   * dev-server 构建成功时不打开浏览器
   * @type {Boolean}
   * @defaults false
   */
  disableReactHotLoader?: boolean;

  /**
   * 排除 babel 编译
   * 目前许多 package 已经使用 es6 输出模块，例如 const / let
   * 如果你需要兼容 IE 浏览器，需要自行定义需要排除的模块
   * @type {String|RegExp}
   * @defaults /node_modules/
   */
  babelExclude?: RuleSetCondition;

  babelUseBuiltIns?: boolean;

  /**
   * 是否要自动生成国际化文案模板至locales/messages.js
   * 我们会用babel来提取您对 @ali/wind-intl 的 intl 对象的使用信息，并汇总出文案需要包含的key
   * @type {Boolean}
   * @defaults true
   */
  babelPluginWindIntl?: boolean;

  useThreads?: boolean;

  /**
   * 是否启用 HappyPack 来加速工程构建
   * @type {Boolean}
   * @defaults true
   */
  useHappyPack?: boolean;

  /**
   * @type {Boolean}
   * @defaults false
   * 是否在构建的时候转义内置的 es6 输出的三方库
   * 详见 https://yuque.antfin-inc.com/wind/breezr_guide/question#a8ccc89b
   */
  es5ImcompatibleVersions?: boolean,

  // file-loader 配置
  staticAssetsOutputPath?: string;

  staticAssetsFileRule?: RegExp;

  staticAssetsBase64Limit?: number;

  staticAssetsOutputName?: string;

  /**
   * @type {Record<string, any>}
   * @defaults {}
   * 全局变量配置
   */
  defineGlobalConstants?: {
    [key: string]: any,
  };

  useTypescript?: boolean;

  useSass?: boolean;

  typescript?: {
    useBabel?: boolean,
    disableTypeChecker?: boolean;
  },

  htmlFileName?: string;

  /**
   * @type {boolean}
   * @defaults false
   * 是否关闭 dev-server 的时候错误美化提示弹层
   */
  disableErrorOverlay?: boolean;

  /**
   * 构建运行时不开启进度指示
   * @type {Boolean}
   * @defaults false
   */
  noProgress?: boolean;

  /**
   * dev-server 构建成功时不打开浏览器
   * @type {Boolean}
   * @defaults false
   */
  noOpen?: false;

  /**
   * 是否开启 terser 作为构件时压缩代码的选项
   */
  useTerserPlugin?: true;

  htmlXmlMode?: boolean;

  // experiment
  experiment?: {
    /**
     * 启用骨架屏
     * @type {Boolean}
     * @defaults false
     */
    skeleton?: boolean;

    longTermCaching?: boolean;
  };

  /**
   * 关闭全局的 babel-polyfill
   */
  disablePolyfill?: boolean;

  intl?: any;

  /**
   * 自定义 wepback 配置
   */
  webpack?: (config: Configuration, options: BreezrPresetConfig, env: Evnrioment) => Configuration;

  /**
   * mocks 相关配置，详细参见
   */
  mocks?: {
    host?: string;
    product?: string;
    oneConsoleProductAlias?: Record<string, string>;
    uriMatch?: string;
    pathReplace?: string,
    proxy?: any;
    disableBodyParser?: boolean;
  }
  /**
   * 开启浏览器兼容性
   */
  browserCompatibility?: boolean;

  /**
   * 是否接入 oneConsole
   */
  oneConsole?: boolean;

  /**
   * 开启控制台 topbar & sidebar
   */
  consoleBase?: boolean | { disabled: boolean };

  /**
   * 监控相关配置，详细参见 https://yuque.antfin-inc.com/wind/breezr_guide/zydbd8
   */
  armsId?: string;
  /**
   * 性能优化 Dll 相关的配置, 详细参见 https://yuque.antfin-inc.com/wind/breezr_guide/hmn5xu
   */
  dll?: {
    dllOutputDir: string;
    dllLib: string[];
  }
  /**
   * 性能优化，开启长效缓存，https://yuque.antfin-inc.com/wind/breezr_guide/gq75o4
   */
  longTermCaching?: boolean;

  plugins?: any;

  product?: string;

  htmlScriptLoading?: 'defer' | 'block';

  aemId?: string;

  ssr?: {
    entry?: string;
    webpack?: (config: Configuration, options: BreezrPresetConfig, env: Evnrioment) => Configuration;
  }
}