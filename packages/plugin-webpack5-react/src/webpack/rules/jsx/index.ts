import * as Chain from '@gem-mine/webpack-chain';
import * as Webpack from 'webpack';
import { error } from '@alicloud/console-toolkit-shared-utils';

import { createRules } from '../../../utils';
import { BreezrReactBabelOption } from '../../../types';
import { getPkgPath, shouldTransform } from './es5ImcompatibleVersions';

const addEs5IncompatibleVersions = (config: Chain, babelConfig: any, es5: boolean, extraInclude?: Webpack.RuleSetCondition) => {
  const extraBabelIncludes: Webpack.RuleSetCondition = [];

  if (es5) {
    extraBabelIncludes.push((path: string) => {
      if (!path.includes('node_modules')) {
        return false;
      }
      const pkgPath = getPkgPath(path);
      return shouldTransform(pkgPath);
    })
  }
  
  if (extraInclude) {
    if (typeof extraInclude === 'string' && !extraInclude.startsWith('/')) {
      extraBabelIncludes.push(require.resolve(extraInclude, { paths: [process.cwd()] }));
    } else {
      extraBabelIncludes.push(extraInclude);
    }
  }

  extraBabelIncludes.forEach((include: Webpack.RuleSetCondition, index: number) => {
    const rule = `extraBabelInclude_${index}`;
    config.module
      .rule(rule)
      .test(/\.m?jsx?$/)
      .include
      .add(include)
      .end()
      .use('babel-loader')
      .loader(require.resolve('babel-loader'))
      .options({
        ...babelConfig,
        sourceType: 'unambiguous'
      });
  });
};

export const jsx = (config: Chain, options: BreezrReactBabelOption) => {
  const {
    reactHotLoader = false,
    reactCssModules = false,
    reactCssModulesContext,
    reactCssModulesResolvePath,
    windRc,
    windCherryPick,
    // windIntl,
    es5ImcompatibleVersions,
    include,
    useBuiltIns,
    reactRefresh = false,
    exclude = /node_modules/,
    // deprecated options
    useHappyPack = false,
  } = options;

  if (useHappyPack) {
    error('useHappyPack is deprecated.');
  }

  const rule = createRules(config, {
    lang: 'js',
    test: /\.jsx?$/
  });

  // if (include) {
  //   rule
  //     .include
  //     .add(include)
  //     .end();
  // }
  
  let babelConfig = options.babelOption ? options.babelOption : {
    presets: [
      [
        require.resolve('@alicloud/babel-preset-xconsole'),
        {
          reactHotLoader,
          reactRefresh,
          reactCssModules,
          reactCssModulesContext,
          reactCssModulesResolvePath,
          windRc,
          useBuiltIns,
          windCherryPick,
          windIntl: false,
        }
      ]
    ]
  };

  if (options.babel) {
    babelConfig = options.babel(babelConfig);
  }

  rule
    .exclude
    .add(exclude)
    .end()
    .use('babel-loader')
    .loader(require.resolve('babel-loader'))
    .options(babelConfig);

    addEs5IncompatibleVersions(config, babelConfig, !!es5ImcompatibleVersions, include);
};
