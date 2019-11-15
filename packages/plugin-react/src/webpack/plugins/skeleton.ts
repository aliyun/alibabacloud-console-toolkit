const Skeleton = require('webpack-plugin-html-skeleton');
import * as Chain from 'webpack-chain';
import { createPlugin } from '../../utils';

export function skeletonPlugin(config: Chain, opt: any) {
  createPlugin(
    config,
    'Skeleton',
    Skeleton,
    opt
  );
}