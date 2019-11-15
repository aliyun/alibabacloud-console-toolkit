import { relative } from 'path';
import { rollup, RollupOptions, OutputOptions, RollupWarning, RollupBuild } from 'rollup';
import chalk from 'chalk';
import * as ms from 'pretty-ms';
import { success, warning, log } from './logger';
import handleError from './handleError';

const createBundle = async (config: RollupOptions) => {
  // Get `inputOptions`, `ouputOptions` from config
  // https://rollupjs.org/guide/en#big-list-of-options
  const {
    output = {},
    // We do not prefer `watchOptions` on build processing
    watch,
    ...inputOptions
  } = config;

  const outputOptions: OutputOptions[] = Array.isArray(output) ? output : [output];
  const start = Date.now();
  const files = outputOptions.map(o => relative(process.cwd(), (o.file || o.dir) as string));
  let inputFiles = '';

  if (typeof inputOptions.input === 'string') {
    inputFiles = inputOptions.input;
  } else if (inputOptions.input instanceof Array) {
    inputFiles = inputOptions.input.join(', ');
  } else if (
    typeof inputOptions.input === 'object' &&
    inputOptions.input !== null
  ) {
    inputFiles = Object.keys(inputOptions.input)
      .map((name: string) => (inputOptions.input as { [propName: string]: string })[name])
      .join(', ');
  }

  log(
    chalk.cyan(
      `\n${chalk.bold(inputFiles)} → ${chalk.bold(files.join(', '))}...`
    )
  );

  if (!inputOptions.onwarn) {
    inputOptions.onwarn = (warn: string | RollupWarning) => {
      if (typeof warn === 'string') {
        warning(`Warning: ${warn}`);
        return;
      }

      // Suppress this error message... there are hundreds of them.
      // https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
      if (warn.code === 'THIS_IS_UNDEFINED') {
        return;
      }
      warning(`Warning: ${warn.message || warn}`);
    };
  }

  try {
    const bundle: RollupBuild = await rollup(inputOptions);
    for (const outputOption of outputOptions) {
      await bundle.write(outputOption);
    }
    success(`created ${files.join(', ')} in ${ms(Date.now() - start)}`);
    return bundle;
  } catch (err) {
    handleError(err);
    process.exit(1);
  }
};

export default createBundle;
