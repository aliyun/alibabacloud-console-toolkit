import React, { useState } from "react";
// @ts-ignore
import env from "@alicloud/breezr-docs-environment";

import Overview from "./Overview";

const params = new URLSearchParams(window.location.search);
const entryKeyFromURL = params.get("entryKey");

const Component: React.FC = props => {
  const [entryKey, setEntryKey] = useState(entryKeyFromURL);
  return (
    <div>
      <Overview
        entryKey={entryKey!}
        onEntryKeyChange={newKey => {
          setEntryKey(newKey);
          params.set("entryKey", newKey);
          params.set("consoleOSId", env.consoleOSId);
          history.pushState(null, "", `?${params.toString()}`);
        }}
      />
    </div>
  );
};

export default Component;
