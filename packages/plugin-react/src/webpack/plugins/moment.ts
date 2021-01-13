import * as Chain from 'webpack-chain';
import * as webpack from 'webpack';

export function momentPlugin(config: Chain) {
  config
    .plugin('IgnoreMomentPlugin')
    .use(webpack.IgnorePlugin, [/^\.\/(?!(zh|en|jp)).*/, /moment\/locale/]);
}