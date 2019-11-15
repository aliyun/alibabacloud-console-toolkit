import * as Chain from 'webpack-chain';
import * as OpenBrowserPlugin from 'open-browser-webpack-plugin';
import { createPlugin } from '../../utils';

const defaultOptions = {
  delay: 1000,
};

export function openBrowserPlugin(config: Chain, options: any) {
  return createPlugin(
    config,
    'openBrowser',
    OpenBrowserPlugin,
    {
      ...defaultOptions,
      ...options
    }
  );
}
