import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';

export default (api: PluginAPI, options: PluginOptions) => {
  if (options.armsId) {
    // arms 上报的的脚本
    const armsScript = options.oneConsole ? `<meta data-type="oneconsole.arms_config" data-pid="${options.armsId}" />` :
      `<script>
!(function(c,b,d,a){c[a]||(c[a]={});c[a].config={pid:"${options.armsId}",imgUrl:"https://arms-retcode.aliyuncs.com/r.png?",enableSPA:true};
  with(b)with(body)with(insertBefore(createElement("script"),firstChild))setAttribute("crossorigin","",src=d)
  })(window,document,"https://retcode.alicdn.com/retcode/bl.js","__bl");
</script>`;
    api.dispatchSync('addHtmlScript', armsScript);

    // arms 静态文件报错的脚本
    const armsStaticSourceTraceScripts =
`<script>
!(function(appSelector,baseSelector,timeout){var tempArr=[];function assetErrorListener(e){if(e.target!==window){tempArr.push({error:new Error("Error: loadAssetsFail"),pos:{filename:e.target.src||e.target.href}})}}function globalErrorListener(e){if(e.target===window){tempArr.push({error:e.error,pos:e})}}window.addEventListener("error",assetErrorListener,true);window.addEventListener("error",globalErrorListener,true);setTimeout(function(){var bl=window.__bl;window.removeEventListener("error",assetErrorListener,true);window.removeEventListener("error",globalErrorListener,true);if(!bl){tempArr.length=0;tempArr=null;return}try{if(bl.error){tempArr.forEach(function(v){bl.error(v.error,v.pos)});tempArr.length=0;tempArr=null;window.addEventListener("error",function(e){if(e.target!==window){bl.error(new Error("Error: loadAssetsFail"),{filename:e.target.src||e.target.href})}},true)}if(bl.avg){bl.avg("dom|body:num",document.querySelector(appSelector).getElementsByTagName("*").length);if(document.body.className.indexOf("hasTopbar")>=0){bl.avg("dom|bar:num",document.querySelector(baseSelector).getElementsByTagName("*").length)}}}catch(ex){}},timeout)})
("#app", "#topbarAndsidebarContainer",10000);
</script>`;
    api.dispatchSync('addHtmlHeadScript', armsStaticSourceTraceScripts);
  }
};
