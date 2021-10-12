import * as ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import * as Chain from 'webpack-chain';
import { createPlugin } from '../../utils';

export function reactRefreshPlugin(config: Chain, options: { [key: string]: any }) {
  // NOTE: there 'HtmlPlugin' name used by breezr-plugin-long-term-caching
  createPlugin(
    config,
    'ReactRefreshPlugin',
    ReactRefreshPlugin,
    {}
  );
}
