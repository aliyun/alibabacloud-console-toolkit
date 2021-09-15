import { resolve, basename } from 'path';
import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';

const DEFAULT_TRANSFORMER_PATH = resolve(
  __dirname,
  'defaultBabelJestTransformer'
);

export async function getActualJestConfig(opts: {
  processJestConfig?: (
    originalJestConfig: any,
    pluginAPI: PluginAPI,
    pluginOpts: PluginOptions
  ) => any;
  babelJestTransformPatterns?: string[];
  projectRootPath: string;
  projectName?: string;
  pluginAPI: PluginAPI;
  pluginOpts: PluginOptions;
}) {
  const {
    babelJestTransformPatterns,
    processJestConfig,
    projectRootPath,
    projectName,
    pluginAPI,
    pluginOpts,
  } = opts;
  // 默认使用项目的目录名来作为项目名称
  const actualProjectName = projectName || basename(projectRootPath);

  let jestConfig = {
    // setupFilesAfterEnv: [require.resolve('jest-enzyme')],
    // testEnvironment: 'enzyme',
    transform: {
      // 插件默认不做任何转换，需要用户配置babelJestTransformPatterns
      '^.+\\.tsx?$': require.resolve('ts-jest')
      //   ...require('ts-jest/presets').defaults.transform,
      // '^.+\\.jsx?$': DEFAULT_TRANSFORMER_PATH,
    } as any,
    testPathIgnorePatterns: ['/node_modules/', '/fixtures/'],
    displayName: actualProjectName,
    rootDir: projectRootPath,
  };

  if (babelJestTransformPatterns) {
    if (!Array.isArray(babelJestTransformPatterns)) {
      throw new Error('babelJestTransformPatterns should be an array');
    }

    babelJestTransformPatterns.forEach((rule: string) => {
      jestConfig.transform[rule] = DEFAULT_TRANSFORMER_PATH;
    });
  }

  if (processJestConfig) {
    if (typeof processJestConfig !== 'function') {
      throw new Error('processJestConfig should be a function');
    }

    jestConfig = await processJestConfig(jestConfig, pluginAPI, pluginOpts);
  }

  return jestConfig;
}
