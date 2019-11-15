import { FullVersion } from 'package-json';
import * as minimist from 'minimist';
import * as ora from 'ora';
import * as execa from 'execa';
import * as semver from 'semver';

import { debug } from '@alicloud/console-toolkit-shared-utils';
import { IContext } from './types';
import { DEBUG_TAG } from './constants';


interface Dependencies {readonly [name: string]: string}

function checkConflict(blockDeps: Dependencies, projectDeps: Dependencies) {
  const lacks: string[][] = [];
  const conflicts: string[][] = [];
  Object.keys(blockDeps).forEach(dep => {
    if (!projectDeps[dep]) {
      lacks.push([dep, blockDeps[dep]]);
    } else if (!semver.intersects(projectDeps[dep], blockDeps[dep])) {
      conflicts.push([dep, blockDeps[dep], projectDeps[dep]]);
    }
  });
  return [lacks, conflicts];
}


function getErrors(allConflicts: string[][]) {
  return `
find dependencies conflict between block and your project:
${allConflicts
    .map(info => {
      return `* ${info[0]}: ${info[2]}(your project) not compatible with ${
        info[1]
      }(block)`;
    })
    .join('\n')}`;
}

export function dependenciesConflictCheck(
  blockPkgDeps = {},
  projectPkgDeps = {},
  blockPkgDevDeps = {},
  projectPkgAllDeps = {},
) {
  const [lacks, conflicts] = checkConflict(blockPkgDeps, projectPkgDeps);
  const [devLacks, devConflicts] = checkConflict(
    blockPkgDevDeps,
    projectPkgAllDeps,
  );
  return {
    conflicts,
    lacks,
    devConflicts,
    devLacks,
  };
}

interface DepsArgs {
  projectPkg: FullVersion;
  cwd: string;
  spinner: ora.Ora;
  args: minimist.ParsedArgs;
  ctx: IContext;
  npmClient: string;
}

export async function installBlockDeps(param: DepsArgs) {
  const { projectPkg, cwd, spinner, args, ctx, npmClient } = param;
  const { dryRun } = args;
  const {
    conflicts,
    lacks,
    devConflicts,
    devLacks
  } = dependenciesConflictCheck(
    ctx.pkg.dependencies,
    projectPkg.dependencies,
    ctx.pkg.devDependencies,
    projectPkg.devDependencies,
  );

  debug(`conflictDeps ${conflicts}, lackDeps ${lacks}`, `devConflictDeps ${devConflicts}, devLackDeps ${devLacks}`);

  // find confilict dependencies throw error
  const allConflicts = [
    ...conflicts,
    ...devConflicts,
  ];

  if (allConflicts.length) {
    throw new Error(getErrors(allConflicts));
  }

  // find lack confilict, auto install
  if (dryRun) {
    debug(DEBUG_TAG, 'dryRun is true, skip install dependencies');
  } else {
    if (lacks.length) {
      const deps = lacks.map((dep: string[]) => `${dep[0]}@${dep[1]}`);
      spinner.start(
        `Install additional dependencies ${deps.join(',')} with ${npmClient}`,
      );
      try {
        await execa(
          npmClient,
          npmClient.includes('yarn')
            ? ['add', ...deps]
            : ['install', ...deps, '--save'],
          { cwd },
        );
      } catch (e) {
        spinner.fail();
        throw new Error(e);
      }
      spinner.succeed();
    }

    if (devLacks.length) {
      // need skip devDependency which already install in dependencies
      const devDeps = devLacks
        .filter(dep => !lacks.find(item => item[0] === dep[0]))
        .map(dep => `${dep[0]}@${dep[1]}`);
      spinner.start(
        `Install additional devDependencies ${devDeps.join(',')} with ${npmClient}`,
      );
      try {
        await execa(
          npmClient,
          npmClient.includes('yarn')
            ? ['add', ...devDeps, '--dev']
            : ['install', ...devDeps, '--save-dev'],
          {
            cwd
          },
        );
      } catch (e) {
        spinner.fail();
        throw new Error(e);
      }
      spinner.succeed();
    }
  }
}