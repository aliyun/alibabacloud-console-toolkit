import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';
import { exit, error, getEnv } from '@alicloud/console-toolkit-shared-utils';

export default (api: PluginAPI, options: PluginOptions) => {
  if (!options.product) {
    error("you should set you production id for topbar");
    exit(0);
  }

  let topbarScripts = `<meta data-type="oneconsole.console_bar" data-version="1.6.5" data-product="${options.product}">`;
  if (getEnv().isDev()) {
    topbarScripts = '<script src="//g.alicdn.com/aliyun/console-base-loader/index.js"></script>';
  }

  api.dispatchSync('addHtmlScript', topbarScripts);
};
