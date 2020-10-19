import { loadExposedModule } from "@alicloud/console-os-react-app";

export interface IDeps {
  react: any;
  "react-dom": any;
  [depName: string]: any;
}

export interface IOverviewProps {
  key?: string;
  onKeyChange?: (newKey: string) => void;
}

export interface IEntryLoaderProps {
  key: string;
}

export function loadOverview(opts: {
  servePath: string;
  consoleOSId: string;
  deps: IDeps;
}): Promise<React.ComponentType<IOverviewProps>> {
  const { servePath, consoleOSId, deps } = opts;
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

  return loadExposedModule(consoleOSAppInfo, "Overview", {
    sandBox: { disable: true }
  })
    .then((m: any) => m())
    .then((m: any) => m.default);
}

export function loadEntryLoader(opts: {
  servePath: string;
  consoleOSId: string;
  deps: IDeps;
}): Promise<React.ComponentType<IEntryLoaderProps>> {
  const { servePath, consoleOSId, deps } = opts;
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
  return loadExposedModule(consoleOSAppInfo, "Loader", {
    sandBox: { disable: true }
  });
}
