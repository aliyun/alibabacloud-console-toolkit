import * as Chain from '@gem-mine/webpack-chain';
import { createPlugin } from '../../utils';
import * as webpack from 'webpack';

export function definePlugin(config: Chain, definitions: { [key: string]: any }) {
  createPlugin(
    config,
    'DefineConstant',
    webpack.DefinePlugin,
    definitions
  );
}
