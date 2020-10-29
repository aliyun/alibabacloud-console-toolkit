import React, { useContext } from "react";
import {
  EntryLoader,
  getInfoFromURL
} from "@alicloud/console-toolkit-multi-entry-loader";

import { ctx } from "../index";

export default {
  a: props => {
    const { children, href } = props;
    const { checkHeadings, resolveAppServePath, resolveAppDeps } = useContext(
      ctx
    );
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
        resolveAppDeps
      );
    }
    return <a {...props} />;
  }
};

function renderXView(
  href,
  checkHeadings,
  resolveAppServePath?: (consoleOSId: string) => string,
  resolveAppDeps?: (consoleOSId: string) => any
) {
  let { consoleOSId, servePath, entryKey } = getInfoFromURL(href);

  if (!consoleOSId) consoleOSId = "xconsole-demos";
  if (!servePath) {
    if (typeof resolveAppServePath === "function") {
      servePath = resolveAppServePath(consoleOSId);
    } else {
      servePath = "https://dev.g.alicdn.com/xconsole/demos/0.1.1/";
    }
  }

  let deps;
  if (typeof resolveAppDeps === "function") {
    deps = resolveAppDeps(consoleOSId);
  }

  return (
    <div className="XView-root">
      <React.Suspense fallback="Loading...">
        <EntryLoader
          consoleOSId={consoleOSId}
          servePath={servePath}
          entryKey={entryKey}
          deps={deps}
          onLoaded={() => {
            if (typeof checkHeadings === "function") {
              checkHeadings();
            }
          }}
          markdownOpts={{ embedded: true }}
          resolveAppServePath={resolveAppServePath}
          resolveAppDeps={resolveAppDeps}
        />
      </React.Suspense>
    </div>
  );
}
