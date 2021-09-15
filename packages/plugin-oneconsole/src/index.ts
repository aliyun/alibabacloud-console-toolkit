import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';

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

  api.dispatchSync('addHtmlHeadScript', '<meta data-type="oneconsole.basic_header" />');
  api.dispatchSync('addHtmlHeadScript', '<meta data-type="oneconsole.console_theme"/>');
  api.dispatchSync('addHtmlPrescript', mountDom);
};
