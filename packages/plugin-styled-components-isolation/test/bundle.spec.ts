import { EventEmitter } from 'events';
import * as webpack from 'webpack';
import * as WebpackChain from 'webpack-chain';
import plugin from '../src';
import { PLUGIN_NAME } from '../src/constants';
import { resolveFixtures } from './__utils__';

const fixtures = resolveFixtures('bundle');
// @ts-ignore
const MemoryFs = require('memory-fs');

describe(`${PLUGIN_NAME}.bundle`, () => {
  let api: EventEmitter;

  beforeEach(() => {
    api = new EventEmitter();
    // @ts-ignore
    api.getCwd = jest.fn(() => {
      return process.cwd();
    });
  });

  fixtures.forEach((fixture) => {
    it(fixture.__name__, (done) => {
      // @ts-ignore
      plugin(api, { styledComponentStyleSheetId: 'FromOption.SheetId' });

      const chain = new WebpackChain();
      chain
        .mode('development')
        .entry('index').add(fixture['actual.js'].path).end()
        .output.path('/__memory__').filename('expected.js').end();

      require(fixture['config.js'].path)(chain);

      api.emit('onChainWebpack', chain);
      const compiler = webpack(chain.toConfig());
      const fs = new MemoryFs();
      compiler.outputFileSystem = fs;
      compiler.run(() => {
        const content = fs.readFileSync('/__memory__/expected.js', 'utf8');
        const expected = require(fixture['expected.js'].path).content;
        expect(content).toContain(expected);
        done();
      });
    });
  });
});
