import React, { useContext } from "react";
import styled from "styled-components";
import {
  EntryLoader,
  getInfoFromURL,
} from "@alicloud/console-toolkit-docs-consumer";

import { ctx } from "../index";

export default {
  a: (props) => {
    const { children, href } = props;
    const {
      checkHeadings,
      resolveAppServePath,
      resolveAppDeps,
      resolveDemoOpts,
      scrollToAnchor,
    } = useContext(ctx);
    if (
      Array.isArray(children) &&
      children.length === 1 &&
      typeof children[0] === "string" &&
      (children[0].startsWith("$XView") || children[0].startsWith("$XDemo"))
    ) {
      return renderXView(
        href,
        checkHeadings,
        scrollToAnchor,
        resolveAppServePath,
        resolveAppDeps,
        resolveDemoOpts
      );
    }
    return <a {...props} />;
  },
};

const DemoRoot = styled.div`
  display: inline-block;
  width: 100%;
`;

function renderXView(
  href,
  checkHeadings,
  scrollToAnchor: () => void,
  resolveAppServePath?: (consoleOSId: string) => string,
  resolveAppDeps?: (consoleOSId: string) => any,
  resolveDemoOpts?: any
) {
  let { consoleOSId, servePath: defaultServePath, entryKey } = getInfoFromURL(
    href
  );
  if (!consoleOSId) consoleOSId = "xconsole-demos";

  let servePath: string | undefined;

  if (typeof resolveAppServePath === "function") {
    // 从解析函数获取的servePath，优先级最高
    servePath = resolveAppServePath(consoleOSId);
  }
  if (!servePath)
    // fallback到用户在markdown link中手动指定的servePath
    servePath =
      defaultServePath || "https://dev.g.alicdn.com/xconsole/demos/0.1.1/";

  return (
    <DemoRoot className="XView-root">
      <React.Suspense fallback="Loading...">
        <EntryLoader
          consoleOSId={consoleOSId}
          servePath={servePath}
          entryKey={entryKey}
          onLoaded={() => {
            if (typeof checkHeadings === "function") {
              checkHeadings();
              scrollToAnchor();
            }
          }}
          markdownOpts={{ embedded: true }}
          resolveAppServePath={resolveAppServePath}
          resolveAppDeps={resolveAppDeps}
          resolveDemoOpts={resolveDemoOpts}
        />
      </React.Suspense>
    </DemoRoot>
  );
}
