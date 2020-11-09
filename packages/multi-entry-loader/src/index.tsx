import { loadExposedModule } from "@alicloud/console-os-react-app";
import { useState } from "react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import qs from "query-string";

export interface IDeps {
  [depName: string]: any;
}

export interface IOverviewProps {
  entryKey?: string;
  onEntryKeyChange?: (newEnrtyKey: string) => void;
  resolveAppServePath?: (consoleOSId: string) => string;
  resolveAppDeps?: (consoleOSId: string) => any;
  useSelfDeps?: boolean;
}

export interface IEntryLoaderProps {
  entryKey: string;
  onLoaded?: () => void;
  markdownOpts?: {
    toc?: boolean;
    embedded?: boolean;
  };
  resolveAppServePath?: (consoleOSId: string) => string;
  resolveAppDeps?: (consoleOSId: string) => any;
  useSelfDeps?: boolean;
}

export interface ConsoleOSOptions {
  servePath: string;
  consoleOSId: string;
  deps?: IDeps;
}

export function load(
  opts: ConsoleOSOptions & {
    exportName: string;
  }
): Promise<any> {
  const { servePath, consoleOSId, deps, exportName } = opts;
  const consoleOSAppInfo = {
    manifest: `${servePath}${consoleOSId}.manifest.json`,
    id: consoleOSId,
    deps: {
      "@alicloud/console-os-environment": {
        publicPath: servePath,
        consoleOSId
      },
      ...deps
    }
  };

  return loadExposedModule(consoleOSAppInfo, exportName, {
    sandBox: { disable: true }
  });
}

export function loadOverview(
  opts: ConsoleOSOptions
): Promise<React.ComponentType<IOverviewProps>> {
  return load({
    ...opts,
    exportName: "Overview"
  })
    .then((m: any) => m())
    .then((m: any) => m.default);
}

export function loadEntryLoader(
  opts: ConsoleOSOptions
): Promise<React.ComponentType<IEntryLoaderProps>> {
  return load({
    ...opts,
    exportName: "Loader"
  });
}

export const EntryLoader: React.FC<ConsoleOSOptions & IEntryLoaderProps> = ({
  servePath,
  consoleOSId,
  deps,
  ...entryLoaderProps
}) => {
  const [ActualEntryLoader] = useState(() => {
    // 本组件不会响应 servePath, consoleOSId, deps 的变化，只会使用第一次的值
    return React.lazy(async () => {
      const { resolveAppDeps, resolveAppServePath } = await wrapResolvers({
        servePath,
        consoleOSId,
        deps,
        ...entryLoaderProps
      });

      const resolvedDeps = resolveAppDeps(consoleOSId);
      const actualDeps = {
        ...resolvedDeps,
        "@breezr-doc-internals/externaled-deps": resolvedDeps
      };

      const ActualEntryLoader = await loadEntryLoader({
        servePath,
        consoleOSId,
        deps: actualDeps
      });
      // 包装一下加载到的组件，覆盖resolveAppDeps，使得它能拿到loadedSelfDeps
      const Wrapped: React.ComponentType<IEntryLoaderProps> = entryLoaderProps => {
        return (
          <ActualEntryLoader
            {...entryLoaderProps}
            resolveAppDeps={resolveAppDeps}
            resolveAppServePath={resolveAppServePath}
          />
        );
      };
      return {
        default: Wrapped
      };
    });
  });

  // 会响应entryKey的变化
  return <ActualEntryLoader {...entryLoaderProps} />;
};

export const Overview: React.FC<ConsoleOSOptions & IOverviewProps> = ({
  servePath,
  consoleOSId,
  deps,
  ...overviewProps
}) => {
  const [ActualOverview] = useState(() => {
    // 本组件不会响应 servePath, consoleOSId, deps 的变化，只会使用第一次的值
    return React.lazy(async () => {
      const { resolveAppDeps, resolveAppServePath } = await wrapResolvers({
        servePath,
        consoleOSId,
        deps,
        ...overviewProps
      });

      const resolvedDeps = resolveAppDeps(consoleOSId);
      const actualDeps = {
        ...resolvedDeps,
        "@breezr-doc-internals/externaled-deps": resolvedDeps
      };

      const ActualOverview = await loadOverview({
        servePath,
        consoleOSId,
        deps: actualDeps
      });
      // 包装一下加载到的组件，覆盖resolveAppDeps，使得它能拿到loadedSelfDeps
      const Wrapped: React.ComponentType<IOverviewProps> = overviewProps => {
        return (
          <ActualOverview
            {...overviewProps}
            resolveAppDeps={resolveAppDeps}
            resolveAppServePath={resolveAppServePath}
          />
        );
      };
      return {
        default: Wrapped
      };
    });
  });

  // 会响应entryKey的变化
  return <ActualOverview {...overviewProps} />;
};

export function getInfoFromURL(url: string) {
  const query = qs.parseUrl(url).query;
  const entryKey = (query.entryKey || query.demoKey) as string;
  const consoleOSId = query.consoleOSId as string;
  const servePath = query.servePath as string;
  return {
    servePath,
    consoleOSId,
    entryKey
  };
}

function ensureEndSlash(path: string) {
  if (path.endsWith("/")) return path;
  return path + "/";
}

async function wrapResolvers({
  useSelfDeps,
  resolveAppDeps: _resolveAppDeps,
  resolveAppServePath: _resolveAppServePath,
  consoleOSId,
  servePath,
  deps
}: Pick<
  IEntryLoaderProps,
  "useSelfDeps" | "resolveAppDeps" | "resolveAppServePath"
> &
  ConsoleOSOptions) {
  let loadedSelfDeps: any;
  // 先加载微应用自己打包的依赖
  if (useSelfDeps) {
    loadedSelfDeps = await load({
      consoleOSId: consoleOSId + "-deps",
      servePath: ensureEndSlash(servePath) + "deps/",
      exportName: "deps"
    });
  }
  // 包装一下resolveAppDeps，使它能拿到loadedSelfDeps，以及deps
  const resolveAppDeps: IEntryLoaderProps["resolveAppDeps"] = appId => {
    if (appId === consoleOSId) {
      return {
        react: React,
        "react-dom": ReactDOM,
        ...loadedSelfDeps,
        ..._resolveAppDeps?.(consoleOSId),
        ...deps
      };
    } else {
      return {
        react: React,
        "react-dom": ReactDOM,
        ..._resolveAppDeps?.(consoleOSId),
        ...deps
      };
    }
  };

  const resolveAppServePath: IEntryLoaderProps["resolveAppServePath"] = appId => {
    let res = _resolveAppServePath?.(appId);
    if (!res && appId === consoleOSId) {
      res = servePath;
    }
    return res ?? "";
  };

  return { resolveAppDeps, resolveAppServePath };
}
