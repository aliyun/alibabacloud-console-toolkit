import * as Chain from '@gem-mine/webpack-chain';
import * as Webpack from 'webpack';
import { createRules } from '../../../utils';
import { BreezrReactBabelOption } from '../../../types';
import { getPkgPath, shouldTransform } from './es5ImcompatibleVersions';

const addEs5ImcompatibleVersions = (config: Chain, babelConfig: any) => {
  const extraBabelIncludes = [
    (a: string) => {
      if (!a.includes('node_modules')) {
        return false;
      }
      const pkgPath = getPkgPath(a);
      return shouldTransform(pkgPath);
    }
  ];

  extraBabelIncludes.forEach((include: Webpack.RuleSetConditionAbsolute, index: number) => {
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
  } = options;

  const rule = createRules(config, {
    lang: 'js',
    test: /\.jsx?$/
  });

  if (include) {
    rule
      .include
      .add(include)
      .end();
  }
  
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

  if (es5ImcompatibleVersions) {
    addEs5ImcompatibleVersions(config, babelConfig);
  }
};
