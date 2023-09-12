import * as bundleAnalyzer from 'webpack-bundle-analyzer';
import * as Chain from '@gem-mine/webpack-chain';
import { createPlugin } from '../../utils';

export function analyzerPlugin(config: Chain) {
  createPlugin(
    config,
    'BundleAnalyzerPlugin',
    bundleAnalyzer.BundleAnalyzerPlugin,
    {}
  );
}
