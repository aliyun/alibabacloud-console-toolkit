import React, { useContext } from "react";
import {
  EntryLoader,
  getInfoFromURL
} from "@alicloud/console-toolkit-multi-entry-loader";

import { ctx } from "../index";

export default {
  a: props => {
    const { children, href } = props;
    const { checkHeadings } = useContext(ctx);
    if (
      Array.isArray(children) &&
      children.length === 1 &&
      typeof children[0] === "string" &&
      children[0].startsWith("$XView")
    ) {
      return renderXView(href, checkHeadings);
    }
    return <a {...props} />;
  }
};

export function renderXView(href, checkHeadings) {
  const { consoleOSId, servePath, entryKey } = getInfoFromURL(href);

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
        />
      </React.Suspense>
    </div>
  );
}
