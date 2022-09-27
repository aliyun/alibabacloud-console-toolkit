import * as Chain from '@gem-mine/webpack-chain';
import OpenBrowserPlugin from 'webpack-open-browser';
import { createPlugin } from '../../utils';

const defaultOptions = {
  delay: 1000,
};

export function openBrowser(config: Chain, options: any) {
  createPlugin(
    config,
    'openBrowser',
    //@ts-ignore
    OpenBrowserPlugin,
    [{
      ...defaultOptions,
      ...options
    }]
  );
}
