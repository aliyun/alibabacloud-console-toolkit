import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';

const browserHint = `
<script type="text/javascript">
(function(){
  var userAgent = window.navigator.userAgent;
  var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1;

  if (isIE) {
    document.write('<div style="background: #fffbd7;border-bottom: 1px solid #ffde03;color:#262626;padding: 8px;">很抱歉，您当前使用的浏览器无法获得最佳体验，建议使用 Chrome、Firefox 或 Safari 浏览器登录阿里云控制台继续浏览。</div>');
  }
})();
</script>
`;

export default (api: PluginAPI, options: PluginOptions) => {
  api.dispatchSync('addHtmlPrescript', browserHint);
};
