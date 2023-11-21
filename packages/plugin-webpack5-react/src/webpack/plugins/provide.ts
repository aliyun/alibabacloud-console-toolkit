import * as Chain from '@gem-mine/webpack-chain';
import { createPlugin } from '../../utils';
import * as webpack from 'webpack';

export function providePlugin(config: Chain) {
  createPlugin(
    config,
    'ProvidePlugin',
    webpack.ProvidePlugin,
    {
      // Make a global `process` variable that points to the `process` package,
      // because the `util` package expects there to be a global variable named `process`.
      process: 'process/browser.js'
   }
  );
}
