import { PluginAPI } from '@alicloud/console-toolkit-core';
import build from './build';
import dev from './dev';
import inspect from './inspect';
import init from './init';
import { BuiltInConfig } from './BuiltInConfig';

export default function (api: PluginAPI, config: BuiltInConfig) {
  build(api, config);
  dev(api, config);
  inspect(api);
  init(api);
}
