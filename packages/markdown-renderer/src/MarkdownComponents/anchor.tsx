import React, { useContext } from "react";
import {
  EntryLoader,
  getInfoFromURL
} from "@alicloud/console-toolkit-multi-entry-loader";

import { ctx } from "../index";

export default {
  a: props => {
    const { children, href } = props;
    const { checkHeadings, xViewAppInfo } = useContext(ctx);
    if (
      Array.isArray(children) &&
      children.length === 1 &&
      typeof children[0] === "string" &&
      (children[0].startsWith("$XView") || children[0].startsWith("$XDemo"))
    ) {
      return renderXView(href, checkHeadings, xViewAppInfo);
    }
    return <a {...props} />;
  }
};

export function renderXView(href, checkHeadings, xViewAppInfo = {}) {
  const {
    consoleOSId = "xconsole-demos",
    servePath = "https://dev.g.alicdn.com/xconsole/demos/0.1.1/",
    entryKey
  } = getInfoFromURL(href);

  const resolved = xViewAppInfo[consoleOSId] ?? {};

  return (
    <div className="XView-root">
      <React.Suspense fallback="Loading...">
        <EntryLoader
          consoleOSId={consoleOSId}
          servePath={resolved.servePath ?? servePath}
          entryKey={entryKey}
          deps={resolved.deps}
          onLoaded={() => {
            if (typeof checkHeadings === "function") {
              checkHeadings();
            }
          }}
          markdownOpts={{ embedded: true }}
        />
      </React.Suspense>
    </div>
  );
}
