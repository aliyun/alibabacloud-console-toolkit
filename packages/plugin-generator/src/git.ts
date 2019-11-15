import * as ora from "ora";
import * as execa from 'execa';
import { IContext } from "./types";

export async function gitClone(ctx: IContext, spinner: ora.Ora) {
  spinner.start('Clone git repo');
  try {
    await execa(
      `git`,
      [`clone`, ctx.repo, ctx.id, `--single-branch`, `-b`, ctx.branch],
      {
        cwd: ctx.blocksTempPath,
        env: process.env,
      },
    );
  } catch (e) {
    spinner.fail();
    throw new Error(e);
  }
  spinner.succeed();
}


export async function gitUpdate(ctx: IContext, spinner: ora.Ora) {
  try {
    spinner.start('Git fetch');
    await execa(`git`, ['fetch'], {
      cwd: ctx.templateTmpDirPath
    });
    spinner.succeed();

    spinner.start(`Git checkout ${ctx.branch}`);
    await execa(`git`, ['checkout', ctx.branch], {
      cwd: ctx.templateTmpDirPath,
    });
    spinner.succeed();

    spinner.start('Git pull');
    await execa(`git`, [`pull`], {
      cwd: ctx.templateTmpDirPath,
    });
    spinner.succeed();

  } catch (e) {
    spinner.fail();
    throw new Error(e);
  }
}