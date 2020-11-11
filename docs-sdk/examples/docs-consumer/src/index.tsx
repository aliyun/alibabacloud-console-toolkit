import React, { useState } from "react";
import { render } from "react-dom";

import {
  Overview,
  EntryLoader
} from "@alicloud/console-toolkit-docs-consumer";

const params = new URLSearchParams(window.location.search);
const urlEntryKey = params.get("entryKey");

function App() {
  const [entryKey, setEntryKey] = useState(urlEntryKey);

  return (
    <React.Suspense fallback="Loading...">
      {/* <h2>EntryLoader</h2>

      <EntryLoader
        servePath="http://localhost:5000/"
        consoleOSId="breezr-docs-fixture"
        entryKey={entryKey}
        markdownOpts={{ toc: true }}
        useSelfDeps
      />

      <hr style={{ margin: "40px 0" }} /> */}

      <h2>Overview</h2>

      <Overview
        servePath="http://localhost:5000/"
        consoleOSId="breezr-docs-fixture"
        entryKey={entryKey}
        onEntryKeyChange={newEntryKey => {
          setEntryKey(newEntryKey);
          params.set("entryKey", newEntryKey);
          history.pushState(null, null as any, `?${params.toString()}`);
        }}
        useSelfDeps
      />
    </React.Suspense>
  );
}

render(<App />, document.querySelector(".app"));
