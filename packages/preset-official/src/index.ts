import { getWindConfig, getEnv } from '@alicloud/console-toolkit-shared-utils';
import { BreezrPresetConfig } from './type';
import { resolve } from 'path';

/**
 * 获取场景，pc 或 mobile
 */
function getScene(config: BreezrPresetConfig) {
  if (config.mobile === true) return 'mobile';

  return 'pc';
}

export default (config: BreezrPresetConfig, args: any) => {
  const windConfig = getWindConfig(process.cwd());
  const env = getEnv();
  const { webpack: userWebpack, webpack5 } = config;
  const plugins = [];

  // dev 模式下，强制开启 babel
  if (env.isDev()) {
    config.typescript = {
      ...config.typescript,
      useBabel: true,
    }
  }

  // 禁用 react-hot-reload
  config.disableReactHotLoader = true;
  // 开启 react-refresh
  config.reactRefresh = true;

  if (!config.disableUpdator) {
    plugins.push([
      '@alicloud/console-toolkit-plugin-updator', {
        packagePath: resolve(__dirname, '../package.json'),
        autoUpdate: false
      }
    ]);
  }

  const { useTypescript, typescript, useSass } = config;
  const publicPath = args.outputPublicPath || config.outputPublicPath;

  plugins.push(...[
    [
      '@alicloud/console-toolkit-plugin-builtin',
      {
        webpack5
      }
    ],
    [
      webpack5 ? '@alicloud/console-toolkit-plugin-webpack5-react' : '@alicloud/console-toolkit-plugin-react',
      {
        ...config,
        port: args.port || config.port || 3333,
        host: args.host || config.host || 'localhost',
        analyze: args.analyze || config.analyze || false,
        output: {
          publicPath
        },
      }
    ],
    [
      '@alicloud/console-toolkit-plugin-long-term-caching',
      {
        longTermCaching: config.experiment && config.experiment.longTermCaching,
        version: env.gitBranch ? env.gitBranch.split('/')[1] : null
      }
    ],
    [
      '@alicloud/console-toolkit-plugin-styled-components-isolation', {
        ...config,
      }
    ],
    [
      webpack5 ? '@alicloud/console-toolkit-plugin-webpack5' : '@alicloud/console-toolkit-plugin-webpack',
      {
        webpack: (...args: any[]) => {
          if (userWebpack) {
            return userWebpack(args[0], config, args[1]);
          }
          return args[0];
        },
        disableHmr: config.disableHmr
      }
    ]
  ]);

  if (!publicPath) {
    plugins.push(
      [
        '@alicloud/console-toolkit-plugin-cdn',
        {
          publishType: args.publishType
        }
      ]
    );
  }

  //@ts-ignore
  if (config.mocks || windConfig.mocks) {
    plugins.push([
      webpack5 ? '@alicloud/console-toolkit-plugin-webpack5-mocks' : '@alicloud/console-toolkit-plugin-mocks',
      {
        //@ts-ignore
        ...windConfig.mocks,
        ...config.mocks
      }
    ]);
  }

  // 浏览器兼容性提示
  if (config.browserCompatibility) {
    plugins.push('@alicloud/console-toolkit-plugin-browser-hint');
  }


  if (config.oneConsole) {
    plugins.push([ '@alicloud/console-toolkit-plugin-oneconsole', {
      ...config,
      scene: getScene(config)
    }]);
  }

  if (config.armsId || config.aemId) {
    plugins.push([ '@alicloud/console-toolkit-plugin-arms', {
      armsId: config.armsId,
      oneConsole: config.oneConsole,
      aemId: config.aemId,
    }]);
  }

  if (useTypescript || typescript) {
    plugins.push([
      webpack5 ? '@alicloud/console-toolkit-plugin-webpack5-typescript' : '@alicloud/console-toolkit-plugin-typescript',
      {
        ...config,
      }
    ]);
  }

  if (useSass) {
    plugins.push([
      webpack5 ? '@alicloud/console-toolkit-plugin-webpack5-sass' : '@alicloud/console-toolkit-plugin-sass',
      {
        ...config
      }
    ]);
  }

  if (config.dll) {
    plugins.push(['@alicloud/console-toolkit-plugin-dll', {
      ...config.dll
    }]);  
  }

  plugins.push(
    [
      '@alicloud/console-toolkit-plugin-unit-jest',
      {
        babelOptions: {
          presets: [
            require.resolve('babel-preset-breezr-wind'),
          ],
          plugins:[]
        }
      }
    ]);

  if (config.ssr) {
    plugins.push(
      [
        webpack5 ? '@alicloud/console-toolkit-plugin-webpack5-ssr' : '@alicloud/console-toolkit-plugin-ssr',
        {
          ...config.ssr,
          webpack: (...args: any[]) => {
            if (config?.ssr?.webpack) {
              return config.ssr.webpack(args[0], config, args[1]);
            }
            return args[0];
          },
        }
      ]);
  }

  return {
    plugins,
  };
};

export { BreezrPresetConfig } from './type';

export const extendConfiguration = (config: BreezrPresetConfig) => {
  return {
    presets: [
      ['@alicloud/console-toolkit-preset-official', config]
    ],
    plugins: config.plugins,
  };
};