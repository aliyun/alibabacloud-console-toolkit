import { resolve, basename } from 'path';
import { readFileSync } from 'fs';
import { sync } from 'glob';
import { transformFileSync } from '@babel/core';
import { isString } from 'util';

interface IFixtureMapperParams {
  name: string;
  expected: string;
  actual: string;
}

type FixtureMapper = (params: IFixtureMapperParams) => void;

const mapFixtures = (fn: FixtureMapper): void => {
  const fixtures = sync(resolve(__dirname, 'fixtures/*/'));
  fixtures.forEach((fixture: string) => {
    const name = basename(fixture);
    const expected = resolve(fixture, 'actual.js');
    const actual = resolve(fixture, 'expected.js');
    fn.call(null, { name, expected, actual });
  });
};

const babelOptions = {
  presets: [
    [require('../src/index'), {
      env: 'development',
    }],
  ],
};

describe('babel-preset-breezr', () => {
  mapFixtures(({ name, expected, actual }) => {
    test(name, () => {
      const expectedFileContent = readFileSync(expected, 'utf8').replace(
        /__DIRNAME__/g,
        resolve(__dirname, '..')
      );

      const actualFileResult = transformFileSync(
        actual,
        babelOptions
      );

      let actualFileContent = '';

      if (actualFileResult !== null) {
        const actualFileCode = (actualFileResult).code;
        if (isString(actualFileCode)) {
          actualFileContent = actualFileCode.trim();
        }
      }

      expect(expectedFileContent.trim()).toEqual(actualFileContent);
    });
  });
});
