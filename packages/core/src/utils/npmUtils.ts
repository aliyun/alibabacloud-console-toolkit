import fs from 'fs-extra';
import axios from 'axios';
import semver from 'semver';
import zlib from 'zlib';
import tar from 'tar';
import inquirer from 'inquirer';

interface IResponseData {
  'dist-tags': Record<string, string>;
  'versions': Record<string, { dist: { tarball: string } }>;
}

export default async function checkEmpty(dir: string): Promise<boolean> {
  let files: string[] = await fs.readdir(dir);
  // filter some special files
  files = files.filter((filename) => {
    return ['node_modules', '.git', '.DS_Store', '.iceworks-tmp', 'build', '.bzbconfig'].indexOf(filename) === -1;
  });
  if (files.length && files.length > 0) {
    return false;
  } else {
    return true;
  }
}

export async function getNpmInfo(name: string, registry?: string) {
  const register = registry || 'https://registry.npmmirror.com';
  const url = new URL(name, register).toString();

  const response = await axios.get<IResponseData>(url);

  return response.data;
}

export async function getNpmTarball(name: string, version: string, registry?: string) {
  try {
    const json = await getNpmInfo(name, registry);
    let exactVersion = version;

    if (!semver.valid(version)) {
      exactVersion = json['dist-tags'][version] || json['dist-tags'].latest;
    }

    return json.versions[exactVersion].dist.tarball;
  } catch (e) {
    throw new Error(`cannot find ${name}@${version} from ${registry}.`);
  }
}

export async function downloadTarball(tarball: string, dest: string) {
  fs.ensureDirSync(dest);

  if (!await checkEmpty(dest)) {
    const { go } = await inquirer.prompt({
      type: 'confirm',
      name: 'go',
      message:
        'The existing file in the current directory. Are you sure to continue?',
      default: false,
    });

    if (!go) process.exit(1);
    fs.emptyDirSync(dest);
  }


  const response = await axios<NodeJS.ReadStream>({
    url: tarball,
    responseType: 'stream',
    timeout: 10000,
  });

  // const totalLength = Number(response.headers['content-length']);
  let downloadLength = 0;

  return new Promise((resolve) => {
    response
      .data
      .on('data', (chunk) => {
        downloadLength += chunk.length;
      })
      .pipe(zlib.createUnzip())
      .pipe(tar.x({
        cwd: dest,
        strip: 1,
      }))
      .on('close', () => {
        resolve(downloadLength);
      })
      .on('finish', () => {
        resolve(downloadLength);
      })
      .on('error', (e) => {
        console.error(`download ${tarball} failed.`);
        console.error(e);
        resolve('failed');
      });
  });
}