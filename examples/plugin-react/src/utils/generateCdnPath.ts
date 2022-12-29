import { IEnvironment } from '@alicloud/console-toolkit-core';

export enum PublishType {
  NORMAL = 'assets',
  OVERWRITE = 'assets_o'
}

const notEmpty = (val: string|undefined) => (typeof val === 'string' && val.trim());

const isValidBranch = (branch: string | undefined) =>
  typeof branch === 'string' && /^[\w-\.]+\/(\d+\.){2}\d+$/.test(branch);

export default function generateCdnPath(env: IEnvironment) {
  const {
    gitBranch,
    gitGroup,
    gitProject,
    publishType = PublishType.NORMAL,
  } = env;

  if (!gitBranch || !isValidBranch(gitBranch)) {
    return null;
  }

  const [, version] = gitBranch.split('/');
  const host = '//g.alicdn.com';
  const paths = [host, gitGroup, gitProject];

  if (publishType === PublishType.NORMAL) {
    paths.push(version);
  }

  const exactPath = paths.filter(notEmpty).join('/');

  return `${exactPath}/`;
}
