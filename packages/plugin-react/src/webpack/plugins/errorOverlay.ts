import * as ErrorOverlayPlugin from 'error-overlay-webpack-plugin';
import * as Chain from '@gem-mine/webpack-chain';
import { createPlugin } from '../../utils';

export function errorOverlay(config: Chain) {
  createPlugin(
    config,
    'ErrorOverlayPlugin',
    ErrorOverlayPlugin,
    {}
  );
}
