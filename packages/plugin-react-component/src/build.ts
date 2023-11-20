import { OutputOptions, rollup } from 'rollup';

import getRollupOptions from './utils/getRollupOptions.js';
import buildCJS from './utils/buildCJS.js';
import buildUmd from './utils/buildUmd.js';

import type { IBuildOptions } from './type';

export default async function build(options: IBuildOptions) {
  /**
   * 默认强制构建 esm
   */
  try {
    // build esm
    console.log('building esm');
    const rollupOpts = getRollupOptions(options);
    const bundles = await rollup(rollupOpts);

    await bundles.write(rollupOpts.output as OutputOptions);
    await bundles.close();
  } catch (e) {
    console.error('build esm failed.');
    throw e;
  }

  /**
   * 默认强制构建 cjs
   */
  try {
    // build cjs
    console.log('building cjs');
    const rollupOpts = buildCJS(options);
    const bundles = await rollup(rollupOpts);

    await bundles.write(rollupOpts.output as OutputOptions);
    await bundles.close();
  } catch (e) {
    console.error('build cjs failed.');
    throw e;
  }

  /**
   * umd 构建需手动开启配置
   */
  if (options.umd && options.umd.name) {
    try {
      // build esm
      console.log('building umd');
      const rollupOpts = buildUmd(options);
      const bundles = await rollup(rollupOpts);

      await bundles.write(rollupOpts.output as OutputOptions);
      await bundles.close();
    } catch (e) {
      console.error('build umd failed.');
      throw e;
    }
  }
}

