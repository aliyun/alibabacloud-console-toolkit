import * as WebpackBar from 'webpackbar';
import * as Chain from '@gem-mine/webpack-chain';
import { createPlugin } from '../../utils';

export function progressPlugin(config: Chain) {
  return createPlugin(
    config,
    'webpackBar',
    WebpackBar,
    {
      profile: true
    }
  );
}