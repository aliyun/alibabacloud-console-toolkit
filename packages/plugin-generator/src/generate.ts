import { PluginAPI } from '@alicloud/console-toolkit-core';
import * as yeoman from 'yeoman-environment';
import { prepareGitTemplate } from './prepareGitTemplate';
import { getGenerateMap } from './generateMap';

function loadGenerator(env: any, name: string) {
  const generatorMap = getGenerateMap();
  const g = generatorMap[name];
  env.register(require.resolve(g.path), g.namespace);
  return g.namespace;
}

function runGenerator(env: any, generator: string,  args?: any) {
  return new Promise((resolve, reject) => {
    try {
      env.run(generator, args, () => {
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

export default async (api: PluginAPI, opts: any) => {
  const generatorMap = getGenerateMap();
  const env = yeoman.createEnv();
  const args: any = {};
  const generator: string | undefined = loadGenerator(env, opts.type);
  const generatorConfig = generatorMap[opts.type];

  if (generatorConfig.type === 'git') {
    const templatePath = await prepareGitTemplate(generatorConfig.url);
    args.templatePath = templatePath;
  }

  if (generator) {
    await runGenerator(env, generator, args);
    api.emit('onGenerated');
  }
};
