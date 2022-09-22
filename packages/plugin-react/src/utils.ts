import * as _ from 'lodash';
import * as Chain from '@gem-mine/webpack-chain';
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


export function createRules(config: Chain, { lang, test, include, exclude }: {
  lang: string;
  test?: webpack.RuleSetConditionAbsolute;
  include?: webpack.RuleSetConditionAbsolute;
  exclude?: webpack.RuleSetConditionAbsolute;
}): Chain.Rule {
  let chain = config.module.rule(lang);

  if (test) chain = chain.test(test);
  if (include) chain = chain.include.add(include).end();
  if (exclude) chain = chain.exclude.add(exclude).end();

  return chain;
}


export function createPlugin<O = any>(config: Chain, name: string, plugin: Chain.PluginClass<any>, options?: O) {
  return config
    .plugin(name)
    .use(plugin, [options]);
}
