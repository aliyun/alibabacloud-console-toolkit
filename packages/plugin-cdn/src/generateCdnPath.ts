import { isString, trim } from "lodash";
import { PublishType, Evnrioment } from '@alicloud/console-toolkit-shared-utils';

const notEmpty = (val: string|undefined, ...args: any[]) => (isString(val) && !!trim(val));

const isValidBranch = (branch: string | undefined) =>
  isString(branch) && /^[\w-\.]+\/(\d+\.){2}\d+$/.test(branch);

export function generateCdnPath(env: Evnrioment) {
  const {
    gitBranch,
    gitGroup,
    gitProject,
    publishType = PublishType.NORMAL,
    publishEnv,
  } = env;

  if (!gitBranch || !isValidBranch(gitBranch)) {
    return null;
  }

  const [, version] = gitBranch.split('/');
  const host = publishEnv === 'daily' ? '//dev.g.alicdn.com' : '//g.alicdn.com';
  const paths = [host, gitGroup, gitProject];

  if (publishType === PublishType.NORMAL) {
    paths.push(version);
  }

  const exactPath = paths.filter(notEmpty).join('/');

  return `${exactPath}/`;
}
