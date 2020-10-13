import React, { useState } from "react";
import Overview from "./Overview";

const params = new URLSearchParams(window.location.search);
const urlDemoKey = params.get("demoKey");

const Component: React.FC = props => {
  const [demoKey, setDemoKey] = useState(urlDemoKey);
  return (
    <div>
      <p>
        这个应用加载 XConsole demo widget，方便设计师快速查看、评审 XConsole 的
        demo
      </p>
      <hr />
      <Overview
        demoKey={demoKey!}
        onDemoKeyChange={newDemoKey => {
          setDemoKey(newDemoKey);
          params.set("demoKey", newDemoKey);
          history.pushState(null, "", `?${params.toString()}`);
        }}
      />
    </div>
  );
};

export default Component;
