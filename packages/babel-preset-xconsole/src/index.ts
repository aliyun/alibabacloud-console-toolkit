import { declare } from '@babel/helper-plugin-utils';
import { merge } from 'lodash';
import createPlugins from './createPlugins';
import createPresets from './createPresets';
import defaultOptions from './defaultOptions';
import { IOptions } from './types';

export default declare((api: any, options: Partial<IOptions> = {}) => {
  api.assertVersion(7);
  const opts: IOptions = merge({}, defaultOptions, options);
  const presets = createPresets(opts);
  const {
    plugins: extraPlugins, reactHotLoader, reactRefresh, env,
    windCherryPick, moduleResolver,
  } = opts;

  return {
    plugins: [
      reactHotLoader && env !== 'production' && !reactRefresh && require.resolve('react-hot-loader/babel'),
      reactRefresh && env !== 'production' && require.resolve('react-refresh/babel'),
      windCherryPick && require.resolve('babel-plugin-wind'),
      moduleResolver && [
        'module-resolver',
        moduleResolver,
      ],
      ...createPlugins(opts),
      ...extraPlugins,
    ].filter(Boolean),
    presets,
  };
});
