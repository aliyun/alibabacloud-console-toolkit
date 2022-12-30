// import { glob } from 'glob';

import { getNpmTarball, downloadTarball } from '../../utils/npmUtils.js';
import type { IContext } from '../../types/service';

// const format = (dir: string, vars?: Reacod<string, any>) => {
//   const files = glob.sync('**/*', { cwd: dir, ignore: ['node_modules/**', 'build/**', '.ice/**', '.rax/**'] });

// };

export default (context: IContext) => {
  context.registerAPI('generate', async ({ name, dir, registry }: { name?: string; dir?: string; registry?: string }) => {
    if (!name) throw new Error('template name is undefined');

    const tarball = await getNpmTarball(name, 'latest', registry);
    await downloadTarball(tarball, dir || context.cwd);
  });
};
