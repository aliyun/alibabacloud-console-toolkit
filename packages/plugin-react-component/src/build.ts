import { OutputOptions, rollup } from 'rollup';

import getRollupOptions from './utils/getRollupOptions.js';

import type { IBuildOptions } from './type';

export default async function build(options: IBuildOptions) {
  const rollupOptions = getRollupOptions(options);

  try {
    const bundles = await rollup(rollupOptions);

    bundles.write(rollupOptions.output as OutputOptions);
  } catch (e) {
    console.error(e);
  }
}

