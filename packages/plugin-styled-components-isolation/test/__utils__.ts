import { resolve, relative, basename } from 'path';
import { sync } from 'glob';
import { readFileSync } from 'fs-extra';
import { FIXTURES_DIR_NAME } from './__const__';

export interface FixtureAttr {
  get(): string;
  path: string;
  relativePath: string;
}

export type Fixture = {
  __name__: string;
} & {
  [key: string]: FixtureAttr;
};

export const resolveFixtures = (category: string): Fixture[] => {
  const categoryPaths = sync(resolve(__dirname, FIXTURES_DIR_NAME, `${category}/*/`));
  return categoryPaths
    .map((path) => ({ name: basename(path), files: sync(resolve(path, '*'))}))
    .map((descriptor) => descriptor.files.reduce((prev, curr) => {
      const fileBasename = basename(curr);
      const relativeFilePath = relative(__dirname, curr);
      return {
        ...prev,
        [fileBasename]: {
          get: () => readFileSync(curr, { encoding: 'utf8' }),
          path: curr,
          relativePath: relativeFilePath
        } as FixtureAttr
      };
    }, { __name__: descriptor.name } as Fixture));
};
