import * as webpack from 'webpack';
import * as WebpackChain from "webpack-chain";
import { sync as readPkgSync, NormalizeOptions } from 'read-pkg';
import { kebabCase, fromPairs } from 'lodash';
import { PluginAPI, PluginOptions } from "@alicloud/console-toolkit-core";
import { getEnv } from '@alicloud/console-toolkit-shared-utils';
import { PLUGIN_NAME, OFFICIAL_ENV, PLUGIN_ENV } from './constants';
import { warning } from './warning';

export interface Options extends PluginOptions {
  styledComponentStyleSheetId?: string | boolean | (() => any);
}

const notEmptyString = (value: any) => (
  typeof value === 'string' && value.trim().length > 0
);

const formatDomCustomizedAttr = <T extends any>(
  fn: (...args: T[]) => string | void
) => (...args: T[]): string | void => {
  let result = fn(...args);

  if (!notEmptyString(result)) {
    return;
  }

  result = kebabCase(result as string).toLowerCase();

  return result.startsWith('data-') ? result : `data-isolated-styled-components-${result}`;
};

const getStyledComponentsStyleSheetId = formatDomCustomizedAttr(
  (...getters: any[]): string | void => {
    for (const getter of getters) {
      if (notEmptyString(getter)) {
        return getter;
      }

      if (typeof getter === 'function') {
        const id = getter();

        if (notEmptyString(id)) {
          return id;
        }
      }
    }
  }
);

const getPkgName = (options: NormalizeOptions) => {
  const pkg = readPkgSync(options);
  if (pkg && pkg.name) {
    warning(
      'The plugin will trying to use the package\'s name ' +
      'as isolation id of styled-components. ' +
      'This behavior usually occurred on dev mode. ' +
      'And if you were received this warning on publish mode then you should ' +
      'to set `options.styledComponentStyleSheetId` implicitly.'
    );
    return pkg.name;
  }
};

export default (api: PluginAPI, options: Options) => {
  api.on('onChainWebpack', async (chain: WebpackChain) => {
    const env = getEnv();
    const styledComponentStyleSheetId = getStyledComponentsStyleSheetId(
      ...OFFICIAL_ENV.concat(PLUGIN_ENV).map(envName => process.env[envName]),
      options.styledComponentStyleSheetId,
      [env.gitGroup, env.gitProject].filter(notEmptyString).join('-'),
      getPkgName.bind(null, { cwd: api.getCwd() }),
    );

    if (!styledComponentStyleSheetId) {
      warning(
        'The plugin can\'t resolve any available id for styled-components isolation. ' +
        'This may cause dynamic styles not working properly ' +
        'if there have several applications that are using styled-components ' +
        'running on the same page. We strongly recommend ' +
        'that you set `options.styledComponentStyleSheetId` implicitly to avoid ' +
        'style crashing.'
      );
      return;
    }

    chain
      .plugin(PLUGIN_NAME)
      .use(webpack.DefinePlugin, [
        fromPairs(OFFICIAL_ENV.map(officialEnv => [
          `process.env.${officialEnv}`,
          JSON.stringify(styledComponentStyleSheetId)
        ]))
      ]);
  });
};
