import * as Chain from '@gem-mine/webpack-chain';
import { createPlugin } from '../../utils';
import * as webpack from 'webpack';

export function ModuleFederationPlugin(config: Chain, options: { [key: string]: any }) {
  createPlugin(
    config,
    'ModuleFederation',
    webpack.container.ModuleFederationPlugin,
    options
  );
}
