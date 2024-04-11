import * as webpack from 'webpack';
import * as Chain from 'webpack-chain';
import { createPlugin } from '../../utils';
import { resolve } from 'path';

export function hmrPlugin(config: Chain) {
  const webpackHotPath = require.resolve('webpack/package.json');

  config
    .resolve
    .alias
    .set('webpack/hot', resolve(webpackHotPath, '..', 'hot'))
    .set('react-dom', '@hot-loader/react-dom');

  createPlugin(
    config,
    'HotModuleReplacement',
    webpack.HotModuleReplacementPlugin
  );
}
