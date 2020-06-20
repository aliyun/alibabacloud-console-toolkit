import { resolve, join } from 'path';
import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';
import { error, exit } from '@alicloud/console-toolkit-shared-utils';
import { getBabelOptions } from './babel';
import { getRollupConfig } from './rollup';
import { resolveExts } from './utils';

export default (config: IOption, cmdArgs: any) => {
  const moduleName = config.moduleName;
  if (!moduleName) {
    error(
      'UMD version should set moduleName in @alicloud/console-toolkit-preset-wind-component configuration'
    );
    exit(1);
  }

  const babelOptions = getBabelOptions(config, {
    module: cmdArgs.esModule ? false : 'commonjs',
    esModules: cmdArgs.esModule === true,
  });
  const babelOptionsForJest = getBabelOptions(
    { ...config, babelModuleResolve: undefined },
    {
      module: cmdArgs.esModule ? false : 'commonjs',
      esModules: cmdArgs.esModule === true,
    }
  );

  const rollupConfig = getRollupConfig({ ...config });

  const outputDir = cmdArgs.esModule ? './es' : './lib';

  const plugins: any[] = [
    [
      require.resolve('@alicloud/console-toolkit-plugin-builtin'),
      {
        engine: 'babel',
      },
    ],

    [
      require.resolve('@alicloud/console-toolkit-plugin-babel'),
      {
        babelOptions,
        cliOptions: {
          outDir: outputDir,
          extensions: resolveExts(config.useTypescript || !!config.typescript),
        },
      },
    ],

    [
      require.resolve('@alicloud/console-toolkit-plugin-rollup'),
      {
        config: {
          ...rollupConfig,
        }
      },
    ],

    [
      require.resolve('@alicloud/console-toolkit-plugin-react'),
      {
        ...config,
        windRc: false,
        windIntl: false,
        disableHtml: true,
        disablePolyfill: true,
        disableReactHotLoader: true,
        entry: config.entry,
      },
    ],

    [
      require.resolve('@alicloud/console-toolkit-plugin-webpack'),
      {
        webpack(webpackConfig: any) {
          webpackConfig.externals = {
            react: {
              root: 'React',
              commonjs2: 'react',
              commonjs: 'react',
              amd: 'react',
            },
            'react-dom': {
              root: 'ReactDOM',
              commonjs2: 'react-dom',
              commonjs: 'react-dom',
              amd: 'react-dom',
            },
            'prop-types': {
              root: 'PropTypes',
              commonjs2: 'prop-types',
              commonjs: 'prop-types',
              amd: 'prop-types',
            },
            ...config.externals,
          };

          webpackConfig.output.path = resolve(process.cwd(), 'dist');

          if (cmdArgs.buildMode === 'system') {
            webpackConfig.output.libraryTarget = 'system';
            webpackConfig.output.filename = 'index.system.js';
          } else {
            webpackConfig.output.library = moduleName;
            webpackConfig.output.libraryTarget = 'umd';
          }

          // @ts-ignore
          if (config.webpack) {
            // @ts-ignore
            config.webpack(webpackConfig);
          }
          return webpackConfig;
        },
      },
    ],

    [
      require.resolve('@alicloud/console-toolkit-plugin-styled-components-isolation'),
      {
        ...config,
      },
    ],

    [
      require.resolve('@alicloud/console-toolkit-plugin-less'),
      {
        src: './src/',
        lib: outputDir,
      },
    ],

    [
      require.resolve('@alicloud/console-toolkit-plugin-storybook'),
      {
        webpackConfigPaths: [
          resolve(__dirname, 'configWebpack.js'),
          ...(config.webpackConfigPaths || []),
        ],
      },
    ],

    [
      require.resolve('@alicloud/console-toolkit-plugin-unit-jest'),
      {
        babelOptions: babelOptionsForJest,
        babelJestTransformPatterns: config.babelJestTransformPatterns || [
          '^.+\\.jsx?$',
        ], // 默认用babel-jest转所有.js文件
        processJestConfig: async (
          originalJestConfig: any,
          pluginAPI: PluginAPI,
          pluginOpts: PluginOptions
        ) => {
          const newJestConfig = { ...originalJestConfig };

          newJestConfig.transformIgnorePatterns =
            newJestConfig.transformIgnorePatterns || [];
          newJestConfig.transformIgnorePatterns.push(
            'node_modules/(?!(@ali/wind-action-creator|@ali/wind-service|@ali/wind-dev-utils|@ali/wind/lib|@ali/wind-rc-link/lib)/)'
          );

          newJestConfig.moduleNameMapper = newJestConfig.moduleNameMapper || {};
          const projectRoot = pluginAPI.getCwd();
          let pkgJson;
          try {
            pkgJson = require(join(projectRoot, 'package.json'));
          } catch (err) {
            error(`cant find package.json under ${projectRoot}`);
            throw err;
          }
          const pkgName = pkgJson.name;
          newJestConfig.moduleNameMapper[`^${pkgName}(.*)$`] = '<rootDir>$1';

          if (config.useTypescript || config.typescript) {
            Object.assign(
              newJestConfig.transform,
              require('ts-jest/presets').defaults.transform
            );
          }

          if (typeof config.processJestConfig === 'function') {
            return config.processJestConfig(newJestConfig);
          } else {
            return newJestConfig;
          }
        },
        bootJest: config.bootJest,
      },
    ],
  ];

  if (config.useTypescript || config.typescript) {
    plugins.push([
      require.resolve('@alicloud/console-toolkit-plugin-typescript'),
      {
        ignoreWebpackModuleDependencyWarning: true,
        disablePolyfill: true,
      },
    ]);
  }

  return {
    plugins,
  };
};
