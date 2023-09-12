import * as WebpackBar from 'webpackbar';
import * as Chain from '@gem-mine/webpack-chain';
import { createPlugin } from '../../utils';

export function progressPlugin(config: Chain) {
  createPlugin(
    config,
    'webpackBar',
    // @ts-ignore
    WebpackBar,
    {
      profile: true
    }
  );
}