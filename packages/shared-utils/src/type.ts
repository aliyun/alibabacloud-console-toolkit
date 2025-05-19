import { FSWatcher } from 'chokidar';

export enum PublishType {
  NORMAL = 'assets',
  OVERWRITE = 'assets_o'
}

export enum BuildType {
  Dev = 1,
  Prod = 1 << 1,
  Local = 1 << 2,
  Cloud = 1 << 3,
  
  Dev_Local = Dev | Local,
  Dev_Cloud = Dev | Cloud,
  Prod_Local = Prod | Local,
  Prod_Cloud = Prod | Cloud,
}

export interface Evnrioment {
  gitBranch?: string;
  gitGroup?: string;
  gitProject?: string;
  publishType?: string;
  windConfigFile?: string;
  defConfigFile?: string;
  nodeEnv?: string;
  logLevel?: string;
  buildArgv?: string;
  buildDestDir?: string;
  builderDir?: string;
  workingDir?: string;
  buildEnv?: string;
  buildType: BuildType;
  publishEnv?: string; // daily or prod
  isProd: () => boolean;
  isDev: () => boolean;
  isCloudBuild: () => boolean;
  isLocalBuild: () => boolean;
}

export interface WatchMap {
  [key: string]: FSWatcher[];
}