import * as Chain from 'webpack-chain';
import { createRules } from '../../utils';
import { BreezrReactBabelOption } from '../../types';

export const jsx = (config: Chain, options: BreezrReactBabelOption) => {
  const {
    reactHotLoader = false,
    reactCssModules = false,
    reactCssModulesContext,
    reactCssModulesResolvePath,
    windRc,
    windCherryPick,
    windIntl,
    include,
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
  
  let babelConfig = {
    // cacheDirectory: false,
    presets: [
      [
        require.resolve('babel-preset-breezr-wind'),
        {
          reactHotLoader,
          reactCssModules,
          reactCssModulesContext,
          reactCssModulesResolvePath,
          windRc,
          windCherryPick,
          windIntl,
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
};
