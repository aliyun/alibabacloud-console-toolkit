import { dirname } from 'path';
import * as pkgUp from 'pkg-up';
import { satisfies } from 'semver';

const pkgPathCache: Record<string, any> = {};
const pkgCache: Record<string, boolean> = {};

const {
  config: { 'es5-imcompatible-versions': packageConfig },
} = require('es5-imcompatible-versions/package.json');

const config = {
  ...packageConfig,
  // 自定义的一些版本需要转义的
  "@ali/xconsole": {
    "^0.9.0": {
      "version": "^0.9.0",
      "reason": "see https://github.com/sindresorhus/ky/blob/master/index.js#L61"
    }
  },
  "@ali/widget-request": {
    "^2.0.0": {
      "version": "^2.0.0",
      "reason": "see https://github.com/sindresorhus/ky/blob/master/index.js#L61"
    }
  },
  "@researchgate/react-intersection-observer": {
    "^1.0.0": {
      "version": "^1.0.0",
      "reason": "see https://github.com/sindresorhus/ky/blob/master/index.js#L61"
    }
  },
  "json-bigint": {
    "^1.0.0": {
      "version": "^1.0.0",
      "reason": "see https://github.com/sidorares/json-bigint/blob/master/lib/parse.js#L7"
    }
  },
  "proxy-polyfill": {
    "^0.3.0": {
      "version": "^0.3.0",
      "reason": "see https://github.com/GoogleChrome/proxy-polyfill"
    }
  },
  "ip-regex": {
    "^2.1.0": {
      "version": "^2.1.0",
      "reason": "see https://github.com/sindresorhus/ip-regex"
    },
    "^3.0.0": {
      "version": "^3.0.0",
      "reason": "see https://github.com/sindresorhus/ip-regex"
    },
    "^4.0.0": {
      "version": "^4.0.0",
      "reason": "see https://github.com/sindresorhus/ip-regex"
    }
  },
  "cidr-regex": {
    "^2.0.0": {
      "version": "^2.0.0",
      "reason": "see https://github.com/sindresorhus/cidr-regex"
    }
  },
  "scoped-regex": {
    "^1.0.0": {
      "version": "^1.0.0",
      "reason": "see https://github.com/sindresorhus/scoped-regex"
    }
  },
  "is-cidr": {
    "^3.0.0": {
      "version": "^3.0.0",
      "reason": "see https://github.com/sindresorhus/is-cidr"
    }
  },
  "is-ip": {
    "^3.0.0": {
      "version": "^3.0.0",
      "reason": "see https://github.com/sindresorhus/is-cidr"
    }
  },
  "postcss": {
    "^8.0.0": {
      "version": "^8.0.0",
      "reason": "see https://github.com/microsoft/monaco-editor"
    }
  },
  'escape-string-regexp': {
    "^2.0.0": {
      "version": "^2.0.0",
      "reason": "see https://github.com/microsoft/monaco-editor"
    }
  }, 
  'nanoid': {
    "^3.0.0": {
      "version": "^3.0.0",
      "reason": "see https://github.com/microsoft/monaco-editor",
    }
  },
  'compare-versions': {
    "*": {
      "version": "*",
      "reason": "see https://github.com/microsoft/monaco-editor",
    }
  },
  "@simplewebauthn/browser": {
    "*": {
      "version": "*",
      "reason": "https://github.com/MasterKale/SimpleWebAuthn/blob/f07dd0b1689f6db41899dfcda628d0caf0f167c2/packages/browser/src/helpers/bufferToBase64URLString.ts#L11"
    }
  },
  "qrcode.react": {
    "*": {
      "version": "*",
      "reason": "https://github.com/zpao/qrcode.react"
    }
  },
  "ahooks": {
    "^3.0.0": {
      "version": "^3.0.0",
      "reason": "https://github.com/alibaba/hooks",
    }
  },
  "monaco-editor": {
    "*": {
      "version": "*",
      "reason": "https://github.com/microsoft/monaco-editor/issues/2817",
    }
  },
  "@monaco-editor/react": {
    "*": {
      "version": "*",
      "reason": "transform es5",
    }
  },
  "": {
    "*": {
      "version": "*",
      "reason": "transform es5",
    }
  },
  "react-error-boundary": {
    "^4.0.0": {
      "version": "^4.0.0",
      "reason": "4.x do not support es5",
    }
  },
  "@hpcc-js/wasm": {
    "*": {
      "version": "*",
      "reason": "not support es5"
    }
  },
  "@antv/xflow": {
    "^2.0.0": {
      "version": "^2.0.0",
      "reason": "not support es5",
    }
  },
  "@ant-design/fast-color": {
    "^2.0.0": {
      "version": "^2.0.0",
      "reason": "not support es5",
    }
  }
};

const ignorePaths = ['nanoid/non-secure']

export function getPkgPath(filePath: string) {
  let dir = dirname(filePath);

  if (dir in pkgPathCache) {
    return pkgPathCache[dir];
  }
  ignorePaths.forEach((ignore) => {
    if (filePath.indexOf(ignore) !== -1) {
      filePath = dirname(dir);
    }
  });
  pkgPathCache[dir] = pkgUp.sync({ cwd: filePath });
  return pkgPathCache[dir];
}

export function shouldTransform(pkgPath: string) {
  if (pkgPath in pkgCache) {
    return pkgCache[pkgPath];
  }
  const { name, version } = require(pkgPath); // eslint-disable-line
  pkgCache[pkgPath] = isMatch(name, version);
  return pkgCache[pkgPath];
}

function isMatch(name: string, version: string) {
  if (config[name]) {
    return Object.keys(config[name]).some(sv => satisfies(version, sv));
  } else {
    return false;
  }
}
