import { loadExposedModule } from "@alicloud/console-os-react-app";
import React, { useState } from "react";

export interface IDeps {
  react: any;
  "react-dom": any;
  [depName: string]: any;
}

export interface IOverviewProps {
  entryKey?: string;
  onEntryKeyChange?: (newEnrtyKey: string) => void;
}

export interface IEntryLoaderProps {
  entryKey: string;
}

export interface ConsoleOSOptions {
  servePath: string;
  consoleOSId: string;
  deps: IDeps;
}

export function load(
  opts: ConsoleOSOptions & {
    exportName: string;
  }
): Promise<React.ComponentType<any>> {
  const { servePath, consoleOSId, deps, exportName } = opts;
  const consoleOSAppInfo = {
    manifest: `${servePath}${consoleOSId}.manifest.json`,
    id: consoleOSId,
    deps: {
      "@alicloud/console-os-environment": {
        publicPath: servePath
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
    return React.lazy(() =>
      loadEntryLoader({
        servePath,
        consoleOSId,
        deps
      }).then(comp => {
        return {
          default: comp
        };
      })
    );
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
  const [ActualEntryLoader] = useState(() => {
    // 本组件不会响应 servePath, consoleOSId, deps 的变化，只会使用第一次的值
    return React.lazy(() =>
      loadOverview({
        servePath,
        consoleOSId,
        deps
      }).then(comp => {
        return {
          default: comp
        };
      })
    );
  });

  // 会响应entryKey的变化
  return <ActualEntryLoader {...overviewProps} />;
};
