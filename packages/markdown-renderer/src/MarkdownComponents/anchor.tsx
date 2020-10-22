import {  } from "@alicloud/console-toolkit-multi-entry-loader";

export default {
  a: ({children}) => {
    if (Array.isArray(children) && children.length === 1 && typeof children[0] === "string" && children[0].startsWith('#XView')) {

    }
  }
}


export function renderXView(href, alfaConfig) {
  const query = qs.parseUrl(href).query
  const demoKey = (query.demoKey || '').toString()
  const consoleOSId = (query.consoleOSId || 'xconsole-demos').toString()

  return (
    <div className="xdemo-root">
      <ConsoleOSDemo
        consoleOSId={consoleOSId}
        demoKey={demoKey}
        alfaConfig={alfaConfig}
      />
    </div>
  )
}
