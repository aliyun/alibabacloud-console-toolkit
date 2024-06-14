import * as ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import * as Chain from 'webpack-chain';
import { createPlugin } from '../../utils';

export function reactRefreshPlugin(config: Chain, options: { [key: string]: any }) {
  createPlugin(
    config,
    'ReactRefreshPlugin',
    ReactRefreshPlugin,
    {
      overlay: false
    }
  );
}
