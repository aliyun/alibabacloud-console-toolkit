import * as path from 'path';

function getPlatformIdentifier() {
  switch (`${process.platform}-${process.arch}`) {
    case 'win32-arm64':
      return 'windows-arm64.exe';
    case 'win32-x64':
    case 'win32-amd64':
      return 'windows-amd64.exe';
    case 'linux-arm64':
      return 'linux-arm64';
    case 'linux-arm':
      return 'linux-arm';
    case 'linux-x64':
    case 'linux-amd64':
      return 'linux-amd64';
    case 'darwin-arm64':
      return 'darwin-arm64';
    case 'darwin-x64':
    case 'darwin-amd64':
      return 'darwin-amd64';
    default:
      return null;
  }
}

export const mkcertVersion = 'v1.4.4';

export function getMkcertBin() {
  const platformIdentifier = getPlatformIdentifier();

  if (!platformIdentifier) {
    return null;
  }

  return path.resolve(
    __dirname,
    `../mkcert-bin/mkcert-${mkcertVersion}-${platformIdentifier}`
  );
}
