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

export enum PublishType {
  NORMAL = 'assets',
  OVERWRITE = 'assets_o',
  TNPM = 'tnpm',
}

export enum PublishEnv {
  DAILY = 'daily',
  PROD = 'PROD',
}

export interface IBuildArgv {
  // 发布类型，如 assets、tnpm 等
  def_publish_type: PublishType;
  // 迭代版本号，如 0.0.1
  def_publish_version: string;
  // 发布的环境（默认不传，当应用开启线上构建时会注入）
  def_publish_env: PublishEnv;
  // 应用 id
  def_work_app_id: string;
}

export interface IEnvironment {
  gitBranch?: string;
  gitGroup?: string;
  gitProject?: string;
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
  /**
   * DEF 发布环境
   */
  publishEnv: PublishEnv;
  /**
   * DEF 发布类型
   */
  publishType: PublishType;
  /**
   * DEF 发布版本
   */
  publishVersion?: string;
  /**
   * def 应用 id
   */
  defAppId?: string;
  isProd: () => boolean;
  isDev: () => boolean;
  isCloudBuild: () => boolean;
  isLocalBuild: () => boolean;
}