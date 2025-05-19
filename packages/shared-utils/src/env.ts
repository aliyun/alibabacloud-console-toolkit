import parser from 'yargs-parser';
import { Evnrioment, BuildType } from "./type";

export function getEnv(): Evnrioment {
  /**
   * 构建器执行环境
   * - local: 执行本地构建
   * - cloud(default): 执行云端构建
   *
   * 该参数将作为扩展参数(extendOptions)传入到windpack中,
   * 以便开发者可以利用扩展参数自定义扩展配置.
   *
   * 如:某些webpack插件只需要在本地构建中使用, 可以在自定义配置中访问这些扩展参数,
   * 在适当的时候开启这些插件(如 webpack-visualizer-plugin).
   */
  const buildEnv = process.env.BUILD_ENV;

  /**
   * 构建工作目录
   */
  const workingDir = process.env.BUILD_WORK_DIR;

  /**
   * 构建器目录
   */
  const builderDir = process.env.BUILD_BUILDER_DIR;

  /**
   * 构建结果存放的目录名称
   * - build(default)
   *
   * 注意: 这个环境变量只输出了构建结果输出的目录**名称**, 而不是目录的完整路径.
   * 如果需要构建目录的完整路径, 需要配合 ``workingDir`` 一起使用
   */
  const buildDestDir = process.env.BUILD_DEST_DIR || process.env.BUILD_DEST;

  /**
   * 构建动态参数
   */
  const buildArgv = process.env.BUILD_ARGV || '[]';

  /**
   * 构建日志显示方式
   *
   * - info(default): 显示基本信息
   * - verbose: 显示详细信息
   */
  const logLevel = process.env.DEF_LOG_LEVEL;

  /**
   * node env
   */
  const nodeEnv = process.env.NODE_ENV;

  /**
   * DEF 配置文件名称
   */
  const defConfigFile = 'abc.json';

  /**
   * wind 项目配置文件名称
   */
  const windConfigFile = '.windrc';

  /**
   * 当前项目 git 分支
   */
  const gitBranch = process.env.BUILD_GIT_BRANCH;

  /**
   * 当前项目 git 组名
   */
  const gitGroup = process.env.BUILD_GIT_GROUP;

  /**
   * 当前项目 git 项目名称
   */
  const gitProject = process.env.BUILD_GIT_PROJECT;

  let buildType = BuildType.Dev;
  if (nodeEnv === 'production') {
    buildType = BuildType.Prod;
  }

  switch(buildEnv) {
    case 'cloud':
      buildType = buildType | BuildType.Cloud;
      break;
    case 'local':
      buildType = buildType | BuildType.Local;
      break;
    default:
  }

  const buildArgvParsed = parser(process.env.BUILD_ARGV_STR || '');
  const publishEnv = buildArgvParsed['def_publish_env'];

  return {
    gitGroup,
    gitProject,
    gitBranch,
    windConfigFile,
    defConfigFile,
    nodeEnv,
    logLevel,
    buildArgv,
    buildDestDir,
    builderDir,
    workingDir,
    buildEnv,
    buildType,
    publishEnv,
    isProd () {
      return (buildType & BuildType.Prod) > 0;
    },
    isCloudBuild () {
      return buildType === BuildType.Prod_Cloud;
    },
    isDev () {
      return (buildType & BuildType.Dev) > 0;
    },
    isLocalBuild () {
      return buildType === BuildType.Prod_Local;
    }
  };
}