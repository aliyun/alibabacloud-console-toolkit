import { declare } from '@babel/helper-plugin-utils';
import { merge } from 'lodash';
import createPlugins from './createPlugins';
import createPresets from './createPresets';
import defaultOptions from './defaultOptions';
import { IOptions, IOptionalOptions } from './types';

export default declare((api: any, options: IOptionalOptions = {}) => {
  api.assertVersion(7);
  const opts: IOptions = merge({}, defaultOptions, options);
  const plugins = createPlugins(opts);
  const presets = createPresets(opts);

  return {
    plugins,
    presets,
  };
});
