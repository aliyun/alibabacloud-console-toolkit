import * as Chain from '@gem-mine/webpack-chain';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import { createPlugin } from '../../utils';

export function htmlPlugin(config: Chain, options: { [key: string]: any }) {
  // NOTE: there 'HtmlPlugin' name used by breezr-plugin-long-term-caching
  createPlugin(
    config,
    'HtmlPlugin',
    HtmlWebpackPlugin,
    {
      filename: 'index.html',
      ...options,
    }
  );
}
