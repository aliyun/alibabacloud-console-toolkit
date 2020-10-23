import React from "react";
import {
  EntryLoader,
  getInfoFromURL
} from "@alicloud/console-toolkit-multi-entry-loader";

export default {
  a: props => {
    const { children, href } = props;
    if (
      Array.isArray(children) &&
      children.length === 1 &&
      typeof children[0] === "string" &&
      children[0].startsWith("$XView")
    ) {
      return renderXView(href);
    }
    return <a {...props} />;
  }
};

export function renderXView(href) {
  const { consoleOSId, servePath, entryKey } = getInfoFromURL(href);

  return (
    <div className="XView-root">
      <React.Suspense fallback="Loading...">
        <EntryLoader
          consoleOSId={consoleOSId}
          servePath={servePath}
          entryKey={entryKey}
        />
      </React.Suspense>
    </div>
  );
}
