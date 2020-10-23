import React, { useEffect, useRef, useState } from "react";

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
      Component: React.ComponentType<any>;
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
  markdownOpts?: {
    toc?: boolean;
    embedded?: boolean;
  };
}> = ({ entryKey, onLoaded, markdownOpts }) => {
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
            const { default: Component } = m;
            setEntry({ type: staticMeta._type, Component });
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
    return <entry.Component {...markdownOpts} />;
  }

  return <entry.Component meta={entry.meta} />;
};

export default Loader;
export { entries };
