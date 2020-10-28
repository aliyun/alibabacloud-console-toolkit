import React from "react";
import { markdownComponents } from "@alicloud/console-toolkit-markdown-renderer";

export default props => {
  return (
    <markdownComponents.code
      {...props}
      style={{
        margin: 0
      }}
    />
  );
};
