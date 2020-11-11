import { loadExposedModule } from "@alicloud/console-os-react-app";
import { useState } from "react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import qs from "query-string";

import type {
  ILoadEntryLoaderOpts,
  IEntryLoaderProps,
  IConsoleOSOptions,
  ILoadOverviewOpts,
  IOverviewProps,
} from "@alicloud/console-toolkit-docs-shared";

export type { IDemoOpts } from "@alicloud/console-toolkit-docs-shared";

function load(
  opts: IConsoleOSOptions & {
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
        consoleOSId,
      },
      ...deps,
    },
  };

  return loadExposedModule(consoleOSAppInfo, exportName, {
    sandBox: { disable: true },
  });
}

export async function loadOverview(
  opts: ILoadOverviewOpts
): Promise<React.ComponentType<IOverviewProps>> {
  const {
    resolveAppDeps,
    resolveAppServePath,
    resolveDemoOpts,
  } = await wrapResolvers(opts);
  const resolvedDeps = resolveAppDeps(opts.consoleOSId);
  const actualDeps = {
    ...resolvedDeps,
    "@breezr-doc-internals/externaled-deps": resolvedDeps,
  };
  const ActualOverview = await load({
    servePath: opts.servePath,
    consoleOSId: opts.consoleOSId,
    deps: actualDeps,
    exportName: "Overview",
  })
    .then((m: any) => m())
    .then((m: any) => m.default);

  // 包装一下加载到的组件，覆盖resolveAppDeps，使得它能拿到loadedSelfDeps
  const Wrapped: React.ComponentType<IOverviewProps> = (props) => {
    const mergedResolveAppDeps = React.useCallback(
      (consoleOSId) => {
        return {
          ...resolveAppDeps(consoleOSId),
          ...props.resolveAppDeps?.(consoleOSId),
        };
      },
      [props.resolveAppDeps]
    );

    const mergedResolveAppServePath = React.useCallback(
      (consoleOSId) => {
        let res = props.resolveAppServePath?.(consoleOSId) ?? "";
        if (!res) res = resolveAppServePath(consoleOSId);
        return res;
      },
      [props.resolveAppDeps]
    );

    const mergedResolveDemoOpts = React.useCallback(
      (consoleOSId) => {
        return {
          ...resolveDemoOpts?.(consoleOSId),
          ...props.resolveDemoOpts?.(consoleOSId),
        };
      },
      [props.resolveDemoOpts]
    );

    const demoOpts = React.useMemo(() => {
      return mergedResolveDemoOpts(opts.consoleOSId);
    }, [mergedResolveDemoOpts]);

    return (
      <ActualOverview
        {...props}
        resolveAppDeps={mergedResolveAppDeps}
        resolveAppServePath={mergedResolveAppServePath}
        resolveDemoOpts={mergedResolveDemoOpts}
        demoOpts={demoOpts}
      />
    );
  };

  return Wrapped;
}

export async function loadEntryLoader(
  opts: ILoadEntryLoaderOpts
): Promise<React.ComponentType<IEntryLoaderProps>> {
  const {
    resolveAppDeps,
    resolveAppServePath,
    resolveDemoOpts,
  } = await wrapResolvers(opts);
  const resolvedDeps = resolveAppDeps(opts.consoleOSId);
  const actualDeps = {
    ...resolvedDeps,
    "@breezr-doc-internals/externaled-deps": resolvedDeps,
  };

  const EntryLoader = await load({
    servePath: opts.servePath,
    consoleOSId: opts.consoleOSId,
    deps: actualDeps,
    exportName: "Loader",
  });

  // 包装一下加载到的组件，覆盖resolveAppDeps，使得它能拿到loadedSelfDeps
  const Wrapped: React.ComponentType<IEntryLoaderProps> = (props) => {
    const mergedResolveAppDeps = React.useCallback(
      (consoleOSId) => {
        return {
          ...resolveAppDeps(consoleOSId),
          ...props.resolveAppDeps?.(consoleOSId),
        };
      },
      [props.resolveAppDeps]
    );
    const mergedResolveAppServePath = React.useCallback(
      (consoleOSId) => {
        let res = props.resolveAppServePath?.(consoleOSId) ?? "";
        if (!res) res = resolveAppServePath(consoleOSId);
        return res;
      },
      [props.resolveAppDeps]
    );

    const mergedResolveDemoOpts = React.useCallback(
      (consoleOSId) => {
        return {
          ...resolveDemoOpts?.(consoleOSId),
          ...props.resolveDemoOpts?.(consoleOSId),
        };
      },
      [props.resolveDemoOpts]
    );

    const demoOpts = React.useMemo(() => {
      return mergedResolveDemoOpts(opts.consoleOSId);
    }, [mergedResolveDemoOpts]);

    return (
      <EntryLoader
        {...props}
        resolveAppDeps={mergedResolveAppDeps}
        resolveAppServePath={mergedResolveAppServePath}
        resolveDemoOpts={mergedResolveDemoOpts}
        demoOpts={demoOpts}
      />
    );
  };
  return Wrapped;
}

export const EntryLoader: React.FC<
  ILoadEntryLoaderOpts & IEntryLoaderProps
> = ({
  servePath,
  consoleOSId,
  deps,
  resolveDemoOpts,
  resolveAppServePath,
  resolveAppDeps,
  useSelfDeps,
  ...entryLoaderProps
}) => {
  const [ActualEntryLoader] = useState(() => {
    // 本组件不会响应 servePath, consoleOSId, deps 的变化，只会使用第一次的值
    return React.lazy(async () => {
      const ActualEntryLoader = await loadEntryLoader({
        servePath,
        consoleOSId,
        deps,
        resolveDemoOpts,
        resolveAppDeps,
        resolveAppServePath,
        useSelfDeps,
      });
      return {
        default: ActualEntryLoader,
      };
    });
  });

  // 会响应entryKey的变化
  return <ActualEntryLoader {...entryLoaderProps} />;
};

export const Overview: React.FC<ILoadOverviewOpts & IOverviewProps> = ({
  servePath,
  consoleOSId,
  deps,
  resolveDemoOpts,
  resolveAppServePath,
  resolveAppDeps,
  useSelfDeps,
  ...overviewProps
}) => {
  const [ActualOverview] = useState(() => {
    // 本组件不会响应 servePath, consoleOSId, deps 的变化，只会使用第一次的值
    return React.lazy(async () => {
      const ActualOverview = await loadOverview({
        servePath,
        consoleOSId,
        deps,
        resolveDemoOpts,
        resolveAppDeps,
        resolveAppServePath,
        useSelfDeps,
      });
      return {
        default: ActualOverview,
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
    entryKey,
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
  deps,
  resolveDemoOpts,
}: ILoadEntryLoaderOpts | ILoadOverviewOpts) {
  let loadedSelfDeps: any;
  // 先加载微应用自己打包的依赖
  if (useSelfDeps) {
    loadedSelfDeps = await load({
      consoleOSId: consoleOSId + "-deps",
      servePath: ensureEndSlash(servePath) + "deps/",
      exportName: "deps",
    });
  }
  // 包装一下resolveAppDeps，使它能拿到loadedSelfDeps，以及deps
  const resolveAppDeps: IEntryLoaderProps["resolveAppDeps"] = (appId) => {
    if (appId === consoleOSId) {
      return {
        react: React,
        "react-dom": ReactDOM,
        ...loadedSelfDeps,
        ..._resolveAppDeps?.(consoleOSId),
        ...deps,
      };
    } else {
      return {
        react: React,
        "react-dom": ReactDOM,
        ..._resolveAppDeps?.(consoleOSId),
        ...deps,
      };
    }
  };

  const resolveAppServePath: IEntryLoaderProps["resolveAppServePath"] = (
    appId
  ) => {
    let res = _resolveAppServePath?.(appId);
    if (!res && appId === consoleOSId) {
      res = servePath;
    }
    return res ?? "";
  };

  return { resolveAppDeps, resolveAppServePath, resolveDemoOpts };
}
