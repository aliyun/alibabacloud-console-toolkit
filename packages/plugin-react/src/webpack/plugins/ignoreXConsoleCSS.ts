import * as Chain from 'webpack-chain';
import * as webpack from 'webpack';

// 忽略 @alicloud/console-components/dist/xconsole.css
export function ignoreXConsoleCSSPlugin(config: Chain) {
  config
    .plugin('IgnoreXConsoleCSSPlugin')
    .use(webpack.IgnorePlugin, [/^@alicloud\/console\-components\/dist\/.+\.css$/]);
}