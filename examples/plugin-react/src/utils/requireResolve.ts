import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default function requireResolve(path: string) {
  return require.resolve(path);
}
