import { render } from "react-dom";
import { MarkdownRenderer } from "@alicloud/console-toolkit-markdown-renderer";

// @ts-ignore
import md from "!!raw-loader!./testMd.md";

import "./index.less";

import React from "react";
import * as ReactDOM from "react-dom";
import * as styled from "styled-components";
import * as components from "@alicloud/console-components";
import * as moment from "moment";

import "@alicloud/console-components/dist/xconsole.css";

const commonDeps = {
  react: React,
  "react-dom": ReactDOM,
  "styled-components": styled,
  "@alicloud/console-components": components,
  moment: moment,
  "@alicloudfe/components": components,
};

const consoleOSAppInfo = {
  "alicloud-component-demos": {
    servePath:
      "https://opensource-microapp.oss-cn-hangzhou.aliyuncs.com/app/breezr-docs/%40alicloudfe/components/-alpha/",
    deps: {
      ...commonDeps,
    },
    demoOpts: {
      modifyDisplayCode: ({ code, meta }) => {
        return code
          .replace(/xdemo-/g, "next-")
          .replace(/@alicloudfe\/components/g, "@alicloud/console-components");
      },
    },
  },
  "xconsole-demos": {
    servePath: "https://g.alicdn.com/xconsole/demos/0.1.1/",
    deps: {
      ...commonDeps,
    },
    demoOpts: {
      modifyDisplayCode: ({ code, meta }) => {
        return code.replace(/xdemo-/g, "next-");
      },
    },
  },
  "breezr-blocks": {
    servePath: "https://g.alicdn.com/breezr/breezr-block/0.1.4/",
    deps: {
      ...commonDeps,
    },
  },
  "xconsole-chart-demos": {
    servePath: "https://g.alicdn.com/txddp/console-charts-demos/0.3.0/",
    deps: {
      ...commonDeps,
    },
  },
};

render(
  <MarkdownRenderer
    source={md}
    toc
    resolveAppServePath={(appId) => {
      return consoleOSAppInfo[appId]?.servePath;
    }}
    resolveDemoOpts={(appId) => {
      return consoleOSAppInfo[appId]?.demoOpts;
    }}
    resolveAppDeps={(appId) => {
      return consoleOSAppInfo[appId]?.deps;
    }}
  />,
  document.querySelector(".app")
);
