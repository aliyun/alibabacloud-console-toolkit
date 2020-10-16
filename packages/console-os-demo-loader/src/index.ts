import { loadExposedModule } from "@alicloud/console-os-react-app";

export interface IDeps {
  react: any;
  "react-dom": any;
  [depName: string]: any;
}

export interface IOverviewProps {
  demoKey?: string;
  onDemoKeyChange?: (newDemoKey: string) => void;
}

export interface IDemoPlayerProps {
  demoKey: string;
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

export function loadDemoPlayer(opts: {
  servePath: string;
  consoleOSId: string;
  deps: IDeps;
}): Promise<React.ComponentType<IDemoPlayerProps>> {
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
  return loadExposedModule(consoleOSAppInfo, "DemoLoader", {
    sandBox: { disable: true }
  });
}
