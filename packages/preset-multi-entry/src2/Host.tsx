import React, { useState } from "react";
import Overview from "./Overview";

const params = new URLSearchParams(window.location.search);
const entryKeyFromURL = params.get("entryKey");

const Component: React.FC = props => {
  const [entryKey, setEntryKey] = useState(entryKeyFromURL);
  return (
    <div>
      <p>
        这个应用加载 XConsole demo widget，方便设计师快速查看、评审 XConsole 的
        demo
      </p>
      <hr />
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
