const generatorMap: GeneratorMap = {
  Component: {
    path: '@alicloud/generator-breezr/generators/library',
    namespace: 'windComponent'
  }
};

export interface GeneratorMeta {
  path: string;
  namespace: string;
  type?: string;
  url?: string;
}

export interface GeneratorMap {
  [key: string]: GeneratorMeta;
}

export function getGenerateMap() {
  return generatorMap;
}