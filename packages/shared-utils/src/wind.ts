import { readJsonSync } from "fs-extra";
import { resolve } from 'path';

const windConfigFile = '.windrc';

export function getWindConfig(cwd: string) {
  let windConfig = {};
  try {
    windConfig = readJsonSync(resolve(cwd, windConfigFile), { encoding: 'utf8' });
  } catch(e) {
    // TODO;
  }
  return windConfig;
}