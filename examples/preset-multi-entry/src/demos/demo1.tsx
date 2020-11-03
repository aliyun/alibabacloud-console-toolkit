/**
 * @title demo1
 * @describe demo1 description.
 * @myCustomOperation myCustomOperationContent
 */

import React from "react";

// @ts-ignore
import("test-external-module").then(testExternal => {
  console.log("testExternal", testExternal);
});

interface IProps {}

const Demo1: React.FC<IProps> = props => {
  return <div>demo1</div>;
};

export default Demo1;
