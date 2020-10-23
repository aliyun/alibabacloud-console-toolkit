import React from "react";
import { render } from "react-dom";

import { MarkdownRenderer } from "../../src";

// @ts-ignore
import md from "!!raw-loader!./testMd.md";

render(<MarkdownRenderer source={md} />, document.querySelector(".app"));
