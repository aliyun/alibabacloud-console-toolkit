import React, { useState } from "react";
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
          history.pushState(null, "", `?${params.toString()}`);
        }}
      />
    </div>
  );
};

export default Component;
