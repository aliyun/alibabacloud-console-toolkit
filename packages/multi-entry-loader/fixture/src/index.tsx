import React from "react";
import { render } from "react-dom";

import { Overview } from "@alicloud/console-toolkit-multi-entry-loader";

function App() {
  return (
    <React.Suspense fallback="Loading...">
      <Overview
        servePath="http://localhost:3335/"
        consoleOSId="multi-entry-fixture"
      />
    </React.Suspense>
  );
}

render(<App />, document.querySelector(".app"));
