import * as UglifyPlugin from 'uglifyjs-webpack-plugin';
import * as TerserPlugin from 'terser-webpack-plugin';
import * as OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import * as Chain from 'webpack-chain';
import { BreezrReactOptions } from '../../types';

export function uglifyPlugin(config: Chain, option: BreezrReactOptions) {
  const { optimization } = config;
  const uglifyOptions = {
    safari10: true,
    compress: {
      collapse_vars: false
    },
    sourceMap: !!option.sourceMap,
    ...option.uglifyOptions
  };

  if (!option.useTerserPlugin) {
    optimization.minimizer('Uglify')
      .use(UglifyPlugin, [{
        parallel: true,
        sourceMap: !!option.sourceMap,
        uglifyOptions,
      }]);
  } else {
    optimization.minimizer('Terser')
      .use(TerserPlugin, [{
        parallel: true,
        sourceMap: !!option.sourceMap,
        terserOptions: uglifyOptions,
      }]);
  }

  config
    .optimization
    .minimizer('OptimizeCSSAssetsPlugin')
    .use(OptimizeCSSAssetsPlugin, [{}]);
}
