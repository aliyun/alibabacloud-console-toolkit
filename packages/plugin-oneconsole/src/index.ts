import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';
import { getEnv } from '@alicloud/console-toolkit-shared-utils';

export default (api: PluginAPI, options: PluginOptions) => {
  const mountDom =
`
<meta data-type="oneconsole.console_config">
<meta data-type="oneconsole.i18n_new">
<div style="position:fixed">
<meta data-type="oneconsole.risk_control">
</div>
<meta data-type="oneconsole.i18n_wind2">
<meta data-type="oneconsole.basic_body">
<meta data-type="oneconsole.product_global">
`;

  let consoleBaseScript = `<meta data-type="oneconsole.console_bar" data-product="${options.product}">`;
  let mobileTopBarScript = '<meta data-type="oneconsole.mobile_bar" />';
  const headerScript = '<meta data-type="oneconsole.basic_header" />';
  const mobileHeaderScript = '<meta data-type="oneconsole.mobile_basic_header" />';

  if (getEnv().isDev()) {
    consoleBaseScript = '<script src="//g.alicdn.com/aliyun/console-base-loader/index.js"></script>';
    mobileTopBarScript = '<link rel="stylesheet" href="https://dev.g.alicdn.com/xconsole-mobile/console-mobile-base/0.1.13/index.css"><script src="https://dev.g.alicdn.com/xconsole-mobile/console-mobile-base/0.1.13/index.js"></script>';
  }

  const enableConsoleBase = options.consoleBase === true || (typeof options.consoleBase === 'object' && !options.consoleBase.disabled);
  
  api.dispatchSync('addHtmlPrescript', mountDom);
  if (options.scene === 'pc') {
    api.dispatchSync('addHtmlHeadScript', headerScript);
    // deprecated
    api.dispatchSync('addHtmlHeadScript', '<meta data-type="oneconsole.console_theme"/>');
    if (enableConsoleBase) api.dispatchSync('addHtmlScript', consoleBaseScript);
  }
  if (options.scene === 'mobile') {
    api.dispatchSync('addHtmlHeadScript', mobileHeaderScript);
    if (enableConsoleBase) api.dispatchSync('addHtmlScript', mobileTopBarScript);
  }
};
