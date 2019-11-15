import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';
import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { getActualJestConfig } from './getActualJestConfig';

const { runCLI } = require('jest-cli');

export default async (api: PluginAPI, opts: PluginOptions) => {
  const projectRootPath = api.getCwd();
  // 将bebel配置提供给babel-jest transformer
  const babelConfig = opts.babelOptions;
  if (babelConfig) {
    writeFileSync(
      resolve(__dirname, 'babel.config.js'),
      `module.exports=${JSON.stringify(babelConfig)}`
    );
  }

  // 根据breezr配置来解析jest配置
  const jestConfig = await getActualJestConfig({
    ...opts,
    projectRootPath,
    pluginAPI: api,
    pluginOpts: opts,
  });

  // 用户可以自定义如何启动Jest（我们把解析好的jest配置提供给他）
  let bootJest: (jestConfig: any, cliArgs: any) => Promise<void>;
  if (opts.bootJest) {
    if (typeof opts.bootJest !== 'function') {
      throw new Error('bootJest should be a function');
    }
    bootJest = opts.bootJest;
  } else {
    // default method to boot jest
    bootJest = async (jestConfig, cliArgs) => {
      await runCLI(
        {
          config: JSON.stringify(jestConfig),
          ...cliArgs,
        },
        [projectRootPath]
      );
    };
  }

  api.registerCommand(
    'test:unit',
    {
      description: 'run unit tests with jest',
      usage: 'bre test:unit [options] <regexForTestFiles>',
      options: {
        '--watch': 'run tests in watch mode',
      },
      details:
        `All jest command line options are supported.\n` +
        `See https://facebook.github.io/jest/docs/en/cli.html for more details.`,
    },
    async args => {
      // 过滤掉无用参数
      delete args._;

      await bootJest(jestConfig, args);
    }
  );

  api.registerSyncAPI('getJestConfig', () => jestConfig);
};
