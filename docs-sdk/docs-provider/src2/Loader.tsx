import React, { useEffect, useRef, useState } from "react";

// @ts-ignore
import DemoContainer from "/@DemoContainer";
// @ts-ignore
import DemoWrapper from "/@DemoWrapper";

// @ts-ignore
import entries from "/@entry-list";

// @ts-ignore
import "/@initializer";

// @ts-ignore
import resolveAppServePathForLocalDev from "/@resolveAppServePathForLocalDev";

// @ts-ignore
import resolveAppServePathFromDeveloper from "/@resolveAppServePathFromDeveloper";

import type { IEntryLoaderProps } from "@alicloud/console-toolkit-docs-shared";
const InterfaceType = React.lazy(() => import("./TypeInfoRenderer/Interface"));

type IEntryInfo =
  | {
      type: "demo";
      Component: React.ComponentType<any>;
      code: string;
      imports: string[];
      meta?: any;
      demoDeps: any;
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
    }
  | {
      type: "typeInfo";
      data: any;
    };

const Loader: React.FC<IEntryLoaderProps> = ({
  entryKey,
  onLoaded,
  markdownOpts,
  demoOpts,
  resolveDemoOpts,
  resolveAppServePath: resolveAppServePathFromLoader,
  resolveAppDeps,
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
          found.load().then((m) => {
            const { demo: Component, meta, code, imports, deps: demoDeps } = m;
            setEntry({
              type: staticMeta._type,
              Component,
              code,
              imports,
              meta: { ...staticMeta, ...meta },
              demoDeps,
            });
          });
          break;
        case "md":
          found.load().then((m) => {
            const { default: Component } = m;
            setEntry({ type: staticMeta._type, Component });
          });
          break;
        case "normal":
          found.load().then((m) => {
            const { default: Component } = m;
            setEntry({ type: staticMeta._type, Component });
          });
          break;
        case "typeInfo":
          found.load().then((m) => {
            const { typeInfo: data } = m;
            setEntry({ type: staticMeta._type, data });
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
      if (typeof onLoaded === "function") {
        onLoaded();
      }
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
        opts={demoOpts}
        demoDeps={entry.demoDeps}
      >
        <entry.Component />
      </DemoContainer>
    );
  }

  if (entry.type === "md") {
    return (
      <entry.Component
        {...markdownOpts}
        resolveDemoOpts={resolveDemoOpts}
        resolveAppServePath={(appId) => {
          let result = "";
          // 仅用于本地开发的 id => ServePath 解析逻辑
          // 以便本地开发的时候能够从本地加载当前微应用
          if (!result && typeof resolveAppServePathForLocalDev === "function") {
            result = resolveAppServePathForLocalDev(appId);
          }
          // 微应用加载者提供的配置
          if (!result && typeof resolveAppServePathFromLoader === "function") {
            result = resolveAppServePathFromLoader(appId);
          }
          // 微应用开发者提供的配置
          if (
            !result &&
            typeof resolveAppServePathFromDeveloper === "function"
          ) {
            result = resolveAppServePathFromDeveloper(appId);
          }
          return result;
        }}
        resolveAppDeps={resolveAppDeps}
      />
    );
  }

  if (entry.type === "typeInfo") {
    return (
      <React.Suspense fallback={null}>
        <InterfaceType typeInfo={entry.data} />
      </React.Suspense>
    );
  }

  return <entry.Component meta={entry.meta} />;
};

export default Loader;
export { entries };
