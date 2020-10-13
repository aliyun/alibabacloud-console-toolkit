import * as bundleAnalyzer from 'webpack-bundle-analyzer';
import * as Chain from 'webpack-chain';
import { createPlugin } from '../../utils';

export function analyzerPlugin(config: Chain) {
  createPlugin(
    config,
    'BundleAnalyzerPlugin',
    bundleAnalyzer.BundleAnalyzerPlugin,
    {}
  );
}
