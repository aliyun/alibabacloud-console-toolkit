import React from "react";
import { render } from "react-dom";
import * as ReactDOM from "react-dom";

import { MarkdownRenderer } from "@alicloud/console-toolkit-markdown-renderer";

// @ts-ignore
import md from "!!raw-loader!./testMd.md";

import "./index.less";

const commonDeps = {
  react: React,
  "react-dom": ReactDOM
};

const consoleOSAppInfo = {
  "alicloud-component-demos": {
    servePath:
      "https://opensource-microapp.oss-cn-hangzhou.aliyuncs.com/app/alicloud-component-docs/",
    deps: {
      ...commonDeps
    }
  },
  "xconsole-demos": {
    // servePath: 'http://localhost:3335/',
    servePath: "https://dev.g.alicdn.com/xconsole/demos/0.1.1/",
    deps: {
      ...commonDeps
    }
  },
  "xconsole-chart-demos": {
    servePath: "https://dev.g.alicdn.com/txddp/console-charts-demos/0.2.0/",
    deps: {
      ...commonDeps
    }
  },
  "breezr-blocks": {
    servePath: "https://dev.g.alicdn.com/breezr/breezr-block/0.1.0/",
    deps: {
      ...commonDeps
    }
  }
};

render(
  <MarkdownRenderer
    source={md}
    toc
    resolveAppServePath={appId => {
      return consoleOSAppInfo[appId]?.servePath;
    }}
  />,
  document.querySelector(".app")
);
