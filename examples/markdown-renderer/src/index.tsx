import React from "react";
import { render } from "react-dom";

import { MarkdownRenderer } from "@alicloud/console-toolkit-markdown-renderer";

// @ts-ignore
import md from "!!raw-loader!./testMd.md";

render(<MarkdownRenderer source={md} toc />, document.querySelector(".app"));
