import { DEFAULT_JS_EXT, DEFAULT_TS_EXT } from './const';
import { IOption, OutputType } from './type/options';
import { isString } from 'util';
import { resolve, join } from 'path';

export function resolveExts(useTypescript: boolean | undefined) {
  if (useTypescript) {
    return [...DEFAULT_JS_EXT, ...DEFAULT_TS_EXT];
  } else {
    return DEFAULT_JS_EXT;
  }
}

const defaultOutput = {
  es: './es',
  cjs: './lib',
  umd: './dist'
};

export const getKeys = <T extends {}>(o: T): Array<keyof T> => <Array<keyof T>>Object.keys(o);

export const getOutputDir = (config: IOption) => {
  if (!config.output) {
    return defaultOutput;
  }

  if (isString(config.output)) {
    return {
      es: join(config.output, 'es'),
      cjs: join(config.output, 'lib'),
      umd: join(config.output, 'dist'),
    };
  }
  const { baseDir = '', dirs = {} } = config.output;

  const finalOutputs: OutputType = defaultOutput;

  return getKeys(defaultOutput).reduce((prev, key) => {
    const dir = dirs[key] ? dirs[key] : defaultOutput[key];
    return { ...prev, [key]: resolve(baseDir, dir as string) };
  }, finalOutputs);
};