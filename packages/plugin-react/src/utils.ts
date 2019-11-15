import * as _ from 'lodash';
import * as Chain from 'webpack-chain';
import * as webpack from 'webpack';

export const resolveOptions = (options: any, defaultOptions: any) => {
  let _defaultOptions = defaultOptions;

  if (_.isFunction(_defaultOptions)) {
    _defaultOptions = _defaultOptions();
  }

  let _options = options;

  if (_.isPlainObject(_options) || _.isPlainObject(_defaultOptions)) {
    _options = _.merge({}, _defaultOptions || {}, _options || {});
  } else {
    _options = _.isUndefined(_options) ? defaultOptions : _options;
  }

  return _options;
};


export function createRules(config: Chain, { lang, test }: {
  lang: string;
  test: webpack.Condition;
}): Chain.Rule {
  return config.module.rule(lang).test(test);
}


export function createPlugin(config: Chain, name: string, plugin: Chain.PluginClass, options?: any) {
  return config
    .plugin(name)
    .use(plugin, [options]);
}
