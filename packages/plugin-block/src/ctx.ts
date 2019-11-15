import { join, resolve } from 'path';
import { existsSync } from 'fs';
// import { spawnSync } from 'child_process';
import * as mkdirp from 'mkdirp';
import * as minimist from 'minimist';
import { merge } from 'lodash';
import { debug } from '@alicloud/console-toolkit-shared-utils';
import { IGitContext, IContext } from './types';
import { DEBUG_TAG } from './constants';

export function makeSureMaterialsTempPathExist(dryRun: boolean) {
  const userHome = require('user-home');
  const blocksTempPath = join(userHome, '.breezr/blocks');
  if (dryRun) {
    return blocksTempPath;
  }
  if (!existsSync(blocksTempPath)) {
    debug(DEBUG_TAG, `mkdir blocksTempPath ${blocksTempPath}`);
    mkdirp.sync(blocksTempPath);
  }
  return blocksTempPath;
}

// export function downloadFromGit(url: string, id: string, branch = 'master', args: minimist.ParsedArgs) {
//   const { dryRun } = args;
//   const blocksTempPath = makeSureMaterialsTempPathExist(dryRun);
//   const templateTmpDirPath = join(blocksTempPath, id);

//   if (existsSync(templateTmpDirPath)) {
//     // git repo already exist, pull it
//     // cd id && git pull
//     info(`${url} exist in cache, start pull from git to update...`);
//     if (dryRun) {
//       log(`dryRun is true, skip git pull`);
//     } else {
//       spawnSync('git', ['fetch'], {
//         cwd: templateTmpDirPath,
//       });
//       spawnSync('git', ['checkout', branch], {
//         cwd: templateTmpDirPath,
//       });
//       spawnSync('git', ['pull'], {
//         cwd: templateTmpDirPath,
//       });
//     }
//   } else {
//     // new git repo, clone
//     // git clone url id
//     info(`start clone code from ${url}...`);
//     if (dryRun) {
//       log(`dryRun is true, skip git clone`);
//     } else {
//       spawnSync('git', ['clone', url, id, '--single-branch', '-b', branch], {
//         cwd: blocksTempPath,
//       });
//     }
//   }
//   info(`code download to ${templateTmpDirPath}`);
//   return templateTmpDirPath;
// }

// git site url maybe like: http://gitlab.alitest-inc.com/bigfish/bigfish-blocks/tree/master/demo
// or http://gitlab.alitest-inc.com/bigfish/testblocks/tree/master
// or http://gitlab.alitest-inc.com/bigfish/testblocks
// or https://github.com/umijs/umi-blocks/tree/master/demo
// or https://github.com/alibaba/ice/tree/master/react-blocks/blocks/AbilityIntroduction
const gitSiteParser = /^(https\:\/\/|http\:\/\/|git\@)((github|gitlab)[\.\w\-]+)(\/|\:)([\w\-]+)\/([\w\-]+)(\/tree\/([\w\.\-]+)([\w\-\/]+))?(.git)?$/;
export function isGitUrl(url: string) {
  return gitSiteParser.test(url);
}

export function parseGitUrl(url: string) {
  // (http|s)://(host)/(group)/(name)/tree/(branch)/(path)
  // @ts-ignore
  const [
    ,
    protocol,
    host,
    ,
    divide, // : or /
    group,
    name,
    ,
    branch = 'master',
    path = '/',
  ] = gitSiteParser.exec(url);
  return {
    repo: `${protocol}${host}${divide}${group}/${name}.git`,
    branch,
    path,
    id: `${host}/${group}/${name}`, // 唯一标识一个 git 仓库
  };
}

function getParsedData(url: string): IGitContext {
  debug(DEBUG_TAG, `url: ${url}`);
  let realUrl;
  if (isGitUrl(url)) {
    realUrl = url;
    debug(DEBUG_TAG, 'is git url');
  } else if (/^[\w]+[\w\-\/]*$/.test(url)) {
    realUrl = `git@github.com:breezr/breezr-block/tree/master/${url}`;
    debug(DEBUG_TAG, `will use ${realUrl} as the block url`);
  } else if (/^[\.\/]/.test(url)) {
    // locale path for test
    const sourcePath = resolve(process.cwd(), url);
    debug(DEBUG_TAG, `will use ${sourcePath} as the block url`);
    return { isLocal: true, sourcePath, repo: '', branch: '', path: '', id: ''};
  } else {
    throw new Error(`${url} can't match any pattern`);
  }
  return {
    isLocal: false,
    sourcePath: '',
    ...parseGitUrl(realUrl),
  };
}

export function getCtx(url: string, args: minimist.ParsedArgs): IContext {
  debug(DEBUG_TAG, `get url ${url}`);

  const ctx = getParsedData(url);
  if (!ctx.isLocal) {
    const blocksTempPath = makeSureMaterialsTempPathExist(args.dryRun);
    const templateTmpDirPath = join(blocksTempPath, ctx.id);

    merge(ctx, {
      sourcePath: join(templateTmpDirPath, ctx.path),
      branch: args.branch || ctx.branch,
      templateTmpDirPath,
      blocksTempPath,
      repoExists: existsSync(templateTmpDirPath),
    });
  }

  return ctx as IContext;
}