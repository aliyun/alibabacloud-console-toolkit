import { BabelCreator, IOptions } from './types';
import { isPluginOrPresetDeclaration } from './utils';

export default function combineCreators(
  creators: BabelCreator[]
): BabelCreator {
  return (options: IOptions) => creators
    .map((creator) => creator(options))
    .filter(isPluginOrPresetDeclaration);
}
