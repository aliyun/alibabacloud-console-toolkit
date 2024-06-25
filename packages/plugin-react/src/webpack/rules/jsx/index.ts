import * as Chain from 'webpack-chain';
import * as Webpack from 'webpack'

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


  extraBabelIncludes.forEach((include: Webpack.Condition, index: number) => {
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
    reactHotLoader,
    reactCssModules,
    reactCssModulesContext,
    reactCssModulesResolvePath,
    windRc,
    windCherryPick,
    // windIntl,
    es5ImcompatibleVersions,
    include,
    useBuiltIns,
    reactRefresh,
    exclude = /node_modules/,
  } = options;

  const rule = createRules(config, {
    lang: 'js',
    test: /\.jsx?$/
  });
  
  let babelConfig = options.babelOption ? options.babelOption : {
    presets: [
      [
        require.resolve('babel-preset-breezr-wind'),
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
