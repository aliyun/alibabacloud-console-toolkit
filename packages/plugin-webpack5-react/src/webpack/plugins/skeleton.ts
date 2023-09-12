const Skeleton = require('webpack-plugin-html-skeleton');
import * as Chain from '@gem-mine/webpack-chain';
import { createPlugin } from '../../utils';

export function skeletonPlugin(config: Chain, opt: any) {
  createPlugin(
    config,
    'Skeleton',
    Skeleton,
    opt
  );
}