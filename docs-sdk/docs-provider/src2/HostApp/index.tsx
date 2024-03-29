import React, { Suspense, useState } from "react";
import ReactDom from "react-dom";
import { Overview } from "@alicloud/console-toolkit-docs-consumer";

declare const __servePath: string;
declare const __consoleOSId: string;

const params = new URLSearchParams(window.location.search);
const entryKeyFromURL = params.get("entryKey");

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
        useSelfDeps
      />
    </Suspense>
  );
}

ReactDom.render(<Host />, document.getElementById("app"));
