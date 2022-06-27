import * as path from 'path';
import * as Chain from 'webpack-chain';

module.exports = (api: any) => {
  api.on('onChainWebpack', (config: Chain) => {
    config.module
      // 允许编译本包中的ts
      .rule('ts')
      .exclude.clear()
      .add({
        not: [path.resolve(__dirname, '../../src2')],
        and: [/node_modules/],
      })
      .end()
      .end()
      // 修改fusion前缀，样式隔离
      .rules.delete('css')
      .end()
      .rule('css')
      .test(/\.css$/)
      .rule('style-loader')
      .use('style-loader')
      .loader(require.resolve('style-loader'))
      .end()
      .end()
      .rule('css-loader')
      .use('css-loader')
      .loader(require.resolve('css-loader'))
      .end()
      .end()
      .rule('fusion-css-loader')
      .resourceQuery(/fusionPrefix/)
      .use('fusion-css-loader')
      .loader(require.resolve('@alicloud/console-toolkit-fusion-css-loader'))
      .end()
      .end()
      .end()
      .end()
      .node.set('fs', 'empty');
  });
};
