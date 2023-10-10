import * as TerserPlugin from 'terser-webpack-plugin';
import * as CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import * as Chain from '@gem-mine/webpack-chain';
import { BreezrReactOptions } from '../../types';

export function uglifyPlugin(config: Chain, option: BreezrReactOptions) {
  const { optimization } = config;
  const uglifyOptions = {
    safari10: true,
    compress: {
      collapse_vars: false
    },
    sourceMap: !!option.sourceMap,
    extractComments: false,
    ...option.uglifyOptions
  };

  optimization.minimizer('Terser')
    .use(TerserPlugin, [{
      parallel: true,
      terserOptions: uglifyOptions,
    }]);

  config
    .optimization
    .minimizer('CssMinimizerPlugin')
    .use(CssMinimizerPlugin, []);
}
