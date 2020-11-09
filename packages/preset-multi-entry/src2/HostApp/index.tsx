import React, { Suspense, useState } from "react";
import ReactDom from "react-dom";
import { Overview } from "@alicloud/console-toolkit-multi-entry-loader";
// @ts-ignore
import deps from "/@externaled-deps";

declare const __servePath: string;
declare const __consoleOSId: string;

const params = new URLSearchParams(window.location.search);
const entryKeyFromURL = params.get("entryKey");

// TODO: 本地开发也使用 useSelfDeps，使得本地开发与线上方案完全一致

function Host() {
  const [entryKey, setEntryKey] = useState(entryKeyFromURL);
  return (
    <Suspense fallback="Loading...">
      <Overview
        servePath={__servePath}
        consoleOSId={__consoleOSId}
        entryKey={entryKey!}
        onEntryKeyChange={newKey => {
          setEntryKey(newKey);
          params.set("entryKey", newKey);
          params.set("consoleOSId", __consoleOSId);
          history.pushState(null, "", `?${params.toString()}`);
        }}
        resolveAppDeps={appId => {
          if (appId === __consoleOSId) {
            return deps;
          }
        }}
      />
    </Suspense>
  );
}

ReactDom.render(<Host />, document.getElementById("app"));
