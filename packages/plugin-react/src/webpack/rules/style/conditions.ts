import { resolve } from 'path';

export function getCondtions(cwd: string) {
  return {
    LessConditionsPreset: {
      stable: {
        test: (value: string) => {
          const shouldBeLess = /\.less$/;
          const shouldBeScopedLess = /\.(scoped?|module)\.less$/;
          const isLess = shouldBeLess.test(value);
          const isScopedLess = shouldBeScopedLess.test(value);
          return isLess && !isScopedLess;
        },
      },
      legacy: {
        test: /\.less$/,
        exclude: [
          resolve(cwd, 'src/components'),
          resolve(cwd, 'src/containers'),
          resolve(cwd, 'src/routes'),
        ],
      },
      widget: {
        test: /\.less$/,
        include: [
          /node_modules/
        ]
      }
    },
    ScopedLessConditionsPreset: {
      stable: {
        test: /\.(scoped?|module)\.less$/,
      },
      legacy: {
        test: /\.less$/,
        include: [
          resolve(cwd, 'src/components'),
          resolve(cwd, 'src/containers'),
          resolve(cwd, 'src/routes'),
        ],
      },
      widget: {
        test: /\.less$/,
        exclude: [
          /node_modules/
        ]
      }
    }
  };
}
