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
    ...option.uglifyOptions
  };

  if (!option.useTerserPlugin) {
    optimization.minimizer('Uglify')
      .use(UglifyPlugin, [{
        parallel: true,
        uglifyOptions,
      }]);
  } else {
    optimization.minimizer('Terser')
      .use(TerserPlugin, [{
        parallel: true,
        terserOptions: uglifyOptions,
      }]);
  }

  config
    .optimization
    .minimizer('OptimizeCSSAssetsPlugin')
    .use(OptimizeCSSAssetsPlugin, [{}]);
}
