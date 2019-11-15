import { getWindConfig, getEnv } from '@alicloud/console-toolkit-shared-utils';
import { resolve } from 'path';

export default (config: any, args: any) => {
  const windConfig = getWindConfig(process.cwd());
  const env = getEnv();
  const webpack = config.webpack;
  const plugins = [];
  if (!config.disableUpdator) {
    plugins.push([
      '@alicloud/console-toolkit-plugin-updator', {
        packagePath: resolve(__dirname, '../package.json'),
        autoUpdate: true
      }
    ]);
  }

  plugins.push(...[
    '@alicloud/console-toolkit-plugin-builtin',
    [
      '@alicloud/console-toolkit-plugin-react',
      {
        ...config,
        port: args.port || config.port || 3333,
        host: args.host || config.host || 'localhost' 
      }
    ],
    [
      '@alicloud/console-toolkit-plugin-cdn',
      {
        publishType: args.publishType
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
      '@alicloud/console-toolkit-plugin-mocks',
      {
        //@ts-ignore
        ...windConfig.mocks,
        ...config.mocks
      }
    ],
    [
      '@alicloud/console-toolkit-plugin-styled-components-isolation', {
        ...config,
      }
    ],
    [
      '@alicloud/console-toolkit-plugin-webpack',
      {
        webpack: (...args: any[]) => {
          if (webpack) {
            return webpack(args[0], config, args[1]);
          }
          return args[0];
        }
      }
    ]
  ]);

  // 浏览器兼容性提示
  if (config.browserCompatibility) {
    plugins.push('@alicloud/console-toolkit-plugin-browser-hint');
  }

  if (config.armsId) {
    plugins.push([ '@alicloud/console-toolkit-plugin-arms', {
      armsId: config.armsId,
    }]);
  }

  if (config.oneConsole) {
    plugins.push([ '@alicloud/console-toolkit-plugin-oneconsole', {
      ...config
    }]);
  }
  if (config.consoleBase) {
    plugins.push([ '@alicloud/console-toolkit-plugin-console-base', {
      product: config.product
    }]);
  }

  const { useTypescript } = config;

  if (useTypescript) {
    plugins.push([
      '@alicloud/console-toolkit-plugin-typescript', {
        ...config,
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

  return {
    plugins,
  };
};
