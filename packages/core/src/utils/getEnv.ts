import parser from 'yargs-parser';

import { IEnvironment, BuildType, PublishType, PublishEnv, IBuildArgv } from '../types/env.js';

export function getEnv(): IEnvironment {
  /**
   * 构建器执行环境
   * - local: 执行本地构建
   * - cloud(default): 执行云端构建
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
  // const windConfigFile = '.windrc';

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

  /**
   * 构建动态参数
   */
  const buildArgv = process.env.BUILD_ARGV || '[]';

  // 解析 def 构建环境变量
  const buildArgvObject = (
    process.env.BUILD_ARGV_STR ? parser(process.env.BUILD_ARGV_STR) : {}
  ) as Partial<IBuildArgv>;

  /**
   * def 发布类型
   */
  const publishType = buildArgvObject.def_publish_type || PublishType.NORMAL;

  /**
   * def 发布环境
   */
  const publishEnv = buildArgvObject.def_publish_env || PublishEnv.PROD;

  /**
   * def 发布版本
   */
  const publishVersion = buildArgvObject.def_publish_version;

  const defAppId = buildArgvObject.def_work_app_id;

  let buildType = BuildType.Dev;
  if (nodeEnv === 'production') {
    buildType = BuildType.Prod;
  }

  switch (buildEnv) {
    case 'cloud':
      buildType |= BuildType.Cloud;
      break;
    case 'local':
      buildType |= BuildType.Local;
      break;
    default:
  }

  return {
    gitGroup,
    gitProject,
    gitBranch,
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
    publishType,
    publishVersion,
    defAppId,
    isProd() {
      return (buildType & BuildType.Prod) > 0;
    },
    isCloudBuild() {
      return buildType === BuildType.Prod_Cloud;
    },
    isDev() {
      return (buildType & BuildType.Dev) > 0;
    },
    isLocalBuild() {
      return buildType === BuildType.Prod_Local;
    },
  };
}
