import * as Chain from 'webpack-chain';
import { ESBuildPlugin, ESBuildMinifyPlugin } from 'esbuild-loader';
import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';
import { Evnrioment } from '@alicloud/console-toolkit-shared-utils';

export default (api: PluginAPI, options: PluginOptions) => {
  api.on('onChainWebpack', async (config: Chain, env: Evnrioment) => {

    config.module.rule('js').uses.clear()
    config.module.rule('ts').uses.clear()
    config.plugins.delete('HappypackJS')
    config.plugins.delete('HappypackTs')

    config.module.rule('js').use('esbuild-loader')
      .loader(require.resolve('esbuild-loader')).options({
        loader: 'jsx',  // Remove this if you're not using JSX
        target: 'es2015'  // Syntax to compile to (see options below for possible values)
      })
    config.module.rule('ts').use('esbuild-loader')
      .loader(require.resolve('esbuild-loader')).options({
        loader: 'tsx',  // Remove this if you're not using JSX
        target: 'es2015'  // Syntax to compile to (see options below for possible values)
      })

    config.plugin('ESBuildPlugin').use(ESBuildPlugin)
    if (env.isProd()) {
      config.optimization.clear();
      config.optimization.minimize(true);
      config.optimization.minimizer('ESBuildMinifyPlugin').use(ESBuildMinifyPlugin, [{
        target: 'es2015',
        minify: true,
      }])
    }
  });
};
