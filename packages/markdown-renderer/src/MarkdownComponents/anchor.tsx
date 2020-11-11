import React, { useContext } from "react";
import {
  EntryLoader,
  getInfoFromURL
} from "@alicloud/console-toolkit-multi-entry-loader";

import { ctx } from "../index";

export default {
  a: props => {
    const { children, href } = props;
    const {
      checkHeadings,
      resolveAppServePath,
      resolveAppDeps,
      resolveDemoOpts
    } = useContext(ctx);
    if (
      Array.isArray(children) &&
      children.length === 1 &&
      typeof children[0] === "string" &&
      (children[0].startsWith("$XView") || children[0].startsWith("$XDemo"))
    ) {
      return renderXView(
        href,
        checkHeadings,
        resolveAppServePath,
        resolveAppDeps,
        resolveDemoOpts
      );
    }
    return <a {...props} />;
  }
};

function renderXView(
  href,
  checkHeadings,
  resolveAppServePath?: (consoleOSId: string) => string,
  resolveAppDeps?: (consoleOSId: string) => any,
  resolveDemoOpts?: any
) {
  let { consoleOSId, servePath, entryKey } = getInfoFromURL(href);

  if (!consoleOSId) consoleOSId = "xconsole-demos";
  if (!servePath) {
    if (typeof resolveAppServePath === "function") {
      servePath = resolveAppServePath(consoleOSId);
    }
    if (!servePath)
      servePath = "https://dev.g.alicdn.com/xconsole/demos/0.1.1/";
  }
  const demoOpts = resolveDemoOpts(consoleOSId);

  return (
    <div className="XView-root">
      <React.Suspense fallback="Loading...">
        <EntryLoader
          consoleOSId={consoleOSId}
          servePath={servePath}
          entryKey={entryKey}
          onLoaded={() => {
            if (typeof checkHeadings === "function") {
              checkHeadings();
            }
          }}
          markdownOpts={{ embedded: true }}
          resolveAppServePath={resolveAppServePath}
          resolveAppDeps={resolveAppDeps}
          demoOpts={demoOpts}
          resolveDemoOpts={resolveDemoOpts}
        />
      </React.Suspense>
    </div>
  );
}
