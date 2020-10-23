import React, { useEffect, useRef, useState } from "react";
import { MarkdownRenderer } from "@alicloud/console-toolkit-markdown-renderer";

// @ts-ignore
import DemoContainer from "/@DemoContainer";
// @ts-ignore
import DemoWrapper from "/@DemoWrapper";

// @ts-ignore
import entries from "/@entry-list";

// @ts-ignore
import "/@initializer";

type IEntryInfo =
  | {
      type: "demo";
      Component: React.ComponentType<any>;
      code: string;
      imports: string[];
      meta?: any;
    }
  | {
      type: "md";
      source: string;
      meta?: any;
    }
  | {
      type: "normal";
      Component: React.ComponentType<any>;
      meta?: any;
    };

const Loader: React.FC<{
  entryKey: string;
  onLoaded?: () => void;
  changeMarkdownSource?: (origin: string) => string;
  markdownTOC?: boolean;
  embeddedMarkdown?: boolean;
}> = ({
  entryKey,
  onLoaded,
  changeMarkdownSource,
  markdownTOC = false,
  embeddedMarkdown = false
}) => {
  const [entry, setEntry] = useState<null | IEntryInfo>(null);

  useEffect(() => {
    if (!entryKey) {
      return;
    }
    const found = entries.find(({ key: itemKey }) => entryKey === itemKey);
    if (found) {
      const staticMeta = found.staticMeta;
      switch (staticMeta._type) {
        case "demo":
          found.load().then(m => {
            const { demo: Component, meta, code, imports } = m;
            setEntry({
              type: staticMeta._type,
              Component,
              code,
              imports,
              meta: { ...staticMeta, ...meta }
            });
          });
          break;
        case "md":
          found.load().then(m => {
            const { default: markdownSource } = m;
            setEntry({ type: staticMeta._type, source: markdownSource });
          });
          break;
        case "normal":
          found.load().then(m => {
            const { default: Component } = m;
            setEntry({ type: staticMeta._type, Component });
          });
          break;
        default:
          break;
      }
    }
  }, [entryKey]);

  const previousEntryRef = useRef(entry);
  useEffect(() => {
    if (previousEntryRef.current !== entry) {
      if (typeof onLoaded === "function") onLoaded();
    }
  }, [entry]);

  if (!entry) {
    return null;
  }

  if (entry.type === "demo") {
    return (
      <DemoContainer
        code={entry.code}
        imports={entry.imports}
        DemoWrapper={DemoWrapper}
        meta={entry.meta}
      >
        <entry.Component />
      </DemoContainer>
    );
  }

  if (entry.type === "md") {
    return (
      <MarkdownRenderer
        source={entry.source}
        toc={markdownTOC}
        embedded={embeddedMarkdown}
      />
    );
  }

  return (
    <entry.Component meta={entry.meta} changeMdSource={changeMarkdownSource} />
  );
};

export default Loader;
export { entries };
