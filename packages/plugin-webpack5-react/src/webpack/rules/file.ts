import * as Chain from '@gem-mine/webpack-chain';
import { createRules } from '../../utils';
import { BreezrReactOptions } from '../../types';

export const file = (config: Chain, options: BreezrReactOptions) => {

  const {
    staticAssetsOutputPath,
    staticAssetsFileRule = /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
    staticAssetsBase64Limit = 5120,
    staticAssetsOutputName = '[name]_[hash:8].[ext]'
  } = options;

  const rule = createRules(config, {
    lang: 'file',
    test: staticAssetsFileRule,
  });

  rule
    .type('javascript/auto')
    .use('url-loader')
    .loader(require.resolve('url-loader'))
    .options({
      limit: staticAssetsBase64Limit,
      name: staticAssetsOutputName,
      outputPath: staticAssetsOutputPath
    });
};
