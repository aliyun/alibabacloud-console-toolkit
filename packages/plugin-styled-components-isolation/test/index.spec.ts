import { EventEmitter } from 'events';
import * as WebpackChain from 'webpack-chain';
import plugin from '../src';
import { PLUGIN_NAME } from '../src/constants';
import * as warning from '../src/warning';

const mockWarning = jest.spyOn(warning, 'warning');
const hasBeenCalled = {
  utils_getEnv: false,
  read_pkg_sync: false,
};

jest.mock('@alicloud/console-toolkit-shared-utils', () => {
  return {
    __esModule: true,
    getEnv: jest.fn(() => {
      if (hasBeenCalled.utils_getEnv) {
        return {};
      }

      return {
        gitGroup: 'GitGroup',
        gitProject: 'GitProject'
      };
    })
  };
});

jest.mock('read-pkg', () => {
  return {
    __esModule: true,
    sync: jest.fn(() => {
      if (hasBeenCalled.read_pkg_sync) {
        return {};
      }

      return {
        name: 'Package'
      };
    })
  };
});

describe(PLUGIN_NAME, () => {
  let chain: WebpackChain;
  let api: EventEmitter;
  let originWarn: typeof console.warn;

  beforeAll(() => {
    originWarn = console.warn;
    console.warn = jest.fn(() => {});
  });

  beforeEach(() => {
    chain = new WebpackChain();
    api = new EventEmitter();
    // @ts-ignore
    api.getCwd = jest.fn(() => {
      return process.cwd();
    });
  });

  afterAll(() => {
    // @ts-ignore
    chain = null;
    // @ts-ignore
    api = null;

    hasBeenCalled.utils_getEnv = false;
    hasBeenCalled.read_pkg_sync = false;
    jest.unmock('@alicloud/console-toolkit-shared-utils');
    jest.unmock('read-pkg');
    console.warn = originWarn;
  });

  it(
    'should append webpack.DefinePlugin with specific defination to plugins ' +
    'if process.env.REACT_APP_SC_ATTR has been declared.',
    () => {
      process.env.REACT_APP_SC_ATTR = 'FromProcessEnv.REACT_APP_SC_ATTR';
      // @ts-ignore
      plugin(api, {});
      api.emit('onChainWebpack', chain);
      const expectedPlugin = chain.plugins.get(PLUGIN_NAME);

      expect(expectedPlugin).not.toBeNull();
      expect(expectedPlugin).not.toBeUndefined();
      expect(expectedPlugin.get('args')).toMatchObject([{
        "process.env.REACT_APP_SC_ATTR": "\"data-isolated-styled-components-from-process-env-react-app-sc-attr\"",
        "process.env.SC_ATTR": "\"data-isolated-styled-components-from-process-env-react-app-sc-attr\""
      }]);
      expect(mockWarning).not.toBeCalled();

      delete process.env.REACT_APP_SC_ATTR;
    }
  );

  it(
    'should append webpack.DefinePlugin with specific defination to plugins ' +
    'if process.env.SC_ATTR has been declared.',
    () => {
      process.env.SC_ATTR = 'FromProcessEnv.SC_ATTR';
      // @ts-ignore
      plugin(api, {});
      api.emit('onChainWebpack', chain);
      const expectedPlugin = chain.plugins.get(PLUGIN_NAME);

      expect(expectedPlugin).not.toBeNull();
      expect(expectedPlugin).not.toBeUndefined();
      expect(expectedPlugin.get('args')).toMatchObject([{
        "process.env.REACT_APP_SC_ATTR": "\"data-isolated-styled-components-from-process-env-sc-attr\"",
        "process.env.SC_ATTR": "\"data-isolated-styled-components-from-process-env-sc-attr\""
      }]);
      expect(mockWarning).not.toBeCalled();

      delete process.env.SC_ATTR;
    }
  );

  it(
    'should append webpack.DefinePlugin with specific defination to plugins ' +
    'if process.env.APP_SC_ID has been declared.',
    () => {
      process.env.APP_SC_ID = 'FromProcessEnv.APP_SC_ID';
      // @ts-ignore
      plugin(api, {});
      api.emit('onChainWebpack', chain);
      const expectedPlugin = chain.plugins.get(PLUGIN_NAME);

      expect(expectedPlugin).not.toBeNull();
      expect(expectedPlugin).not.toBeUndefined();
      expect(expectedPlugin.get('args')).toMatchObject([{
        "process.env.REACT_APP_SC_ATTR": "\"data-isolated-styled-components-from-process-env-app-sc-id\"",
        "process.env.SC_ATTR": "\"data-isolated-styled-components-from-process-env-app-sc-id\""
      }]);
      expect(mockWarning).not.toBeCalled();

      delete process.env.APP_SC_ID;
    }
  );

  it(
    'should append webpack.DefinePlugin with specific defination to plugins ' +
    'if options.styledComponentStyleSheetId has been declared.',
    () => {
      // @ts-ignore
      plugin(api, { styledComponentStyleSheetId: 'FromOption.SheetId' });
      api.emit('onChainWebpack', chain);
      const expectedPlugin = chain.plugins.get(PLUGIN_NAME);

      expect(expectedPlugin).not.toBeNull();
      expect(expectedPlugin).not.toBeUndefined();
      expect(expectedPlugin.get('args')).toMatchObject([{
        "process.env.REACT_APP_SC_ATTR": "\"data-isolated-styled-components-from-option-sheet-id\"",
        "process.env.SC_ATTR": "\"data-isolated-styled-components-from-option-sheet-id\""
      }]);
      expect(mockWarning).not.toBeCalled();
    }
  );

  it(
    'should append webpack.DefinePlugin with specific defination to plugins ' +
    'if env.gitGroup or env.gitProject have been declared.',
    () => {
      // @ts-ignore
      plugin(api, {});
      api.emit('onChainWebpack', chain);
      const expectedPlugin = chain.plugins.get(PLUGIN_NAME);

      expect(expectedPlugin).not.toBeNull();
      expect(expectedPlugin).not.toBeUndefined();
      expect(expectedPlugin.get('args')).toMatchObject([{
        "process.env.REACT_APP_SC_ATTR": "\"data-isolated-styled-components-git-group-git-project\"",
        "process.env.SC_ATTR": "\"data-isolated-styled-components-git-group-git-project\""
      }]);
      expect(mockWarning).not.toBeCalled();
    }
  );

  it(
    'should append webpack.DefinePlugin with specific defination to plugins ' +
    'if package.json have been found.',
    () => {
      hasBeenCalled.utils_getEnv = true;
      // @ts-ignore
      plugin(api, {});
      api.emit('onChainWebpack', chain);
      const expectedPlugin = chain.plugins.get(PLUGIN_NAME);

      expect(expectedPlugin).not.toBeNull();
      expect(expectedPlugin).not.toBeUndefined();
      expect(expectedPlugin.get('args')).toMatchObject([{
        "process.env.REACT_APP_SC_ATTR": "\"data-isolated-styled-components-package\"",
        "process.env.SC_ATTR": "\"data-isolated-styled-components-package\""
      }]);
      expect(mockWarning).toBeCalled();
    }
  );

  it(
    'should not append anything to plugins ' +
    'if there has no matched inputs.',
    () => {
      hasBeenCalled.read_pkg_sync = true;
      // @ts-ignore
      plugin(api, {});
      api.emit('onChainWebpack', chain);
      const expectedPlugin = chain.plugins.get(PLUGIN_NAME);

      expect(expectedPlugin).not.toBeNull();
      expect(expectedPlugin).toBeUndefined();
      expect(mockWarning).toBeCalled();
    }
  );
});
