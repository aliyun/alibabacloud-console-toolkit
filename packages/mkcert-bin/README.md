# @alicloud/mkcert-bin

Collection of [mkcert](https://github.com/FiloSottile/mkcert) binaries.

Currently binaries are downloaded manually from GitHub, the version of this package will match that of `mkcert`.

Only pre-built binaries are included, other platforms or arches are not supported.

## Usage

```js
const { getMkcertBin } = require('@alicloud/mkcert-bin');

// full path to mkcert binary executable, or `null` if platform or arch is not suppported.
const mkcertPath = getMkcertBin();
```

## Included Binaries

This package includes binaries from the [mkcert](https://github.com/FiloSottile/mkcert) project. These binaries are distributed in the `./mkcert-bin` directory of the `npm` package.

The mkcert project is licensed under the BSD-3-Clause license. A copy of this license is included in our project in the `LICENSE-mkcert.txt` file located in the root directory of this package.

For more information about mkcert and its license, please visit the [mkcert GitHub page](https://github.com/FiloSottile/mkcert).
