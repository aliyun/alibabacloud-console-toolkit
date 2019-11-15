import * as ora from 'ora';
import { getCtx } from './ctx';
import { gitUpdate, gitClone } from './git';


export async function prepareGitTemplate(url: string| undefined){
  if (!url) {
    return;
  }
  const spinner = ora();

  const ctx = getCtx(url, ({
    path: 'packages/xconsole-example'
  }) as any);

  // 2. clone git repo
  if (!ctx.isLocal && !ctx.repoExists) {
    await gitClone(ctx, spinner);
  }

  // 3. update git repo
  if (!ctx.isLocal && ctx.repoExists) {
    await gitUpdate(ctx, spinner);
  }

  return ctx.sourcePath;
}
