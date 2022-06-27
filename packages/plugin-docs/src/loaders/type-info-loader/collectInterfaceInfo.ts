import ts from "typescript";

const defaultTsConfig: ts.CompilerOptions = {
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
};

interface InterfaceInfo {
  name: string;
  documentation: string;
  properties: InterfacePropertyInfo[];
}

interface InterfacePropertyInfo {
  name: string;
  typeText: string;
  documentation: string;
  defaultValue?: string;
}

export function collectInterfaceInfo(fileName: string): InterfaceInfo {
  // Build a program using the set of root file names in fileNames
  let program = ts.createProgram([fileName], defaultTsConfig);
  // Get the checker, we will use it to find more about classes
  let checker = program.getTypeChecker();

  const sourceFile = program.getSourceFile(fileName)!;

  // inspired by
  // https://github.com/microsoft/rushstack/blob/6ca0cba723ad8428e6e099f12715ce799f29a73f/apps/api-extractor/src/analyzer/ExportAnalyzer.ts#L702
  // and https://stackoverflow.com/a/58885450
  const fileSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!fileSymbol || !fileSymbol.exports) {
    throw new Error(`unexpected fileSymbol`);
  }
  // 找第一个export
  const exportSymbol = fileSymbol.exports.values().next().value;
  if (!exportSymbol) {
    throw new Error(`no export is not found in file`);
  }
  const sourceDeclareSymbol = getAliasedSymbolIfNecessary(exportSymbol);
  const sourceDeclare = sourceDeclareSymbol.declarations?.[0];
  if (!sourceDeclare) {
    throw new Error(`Can't find sourceDeclare`);
  }
  const interfaceInfo = collectInterfaceInfo(
    sourceDeclare,
    sourceDeclareSymbol
  );
  return interfaceInfo;

  function getAliasedSymbolIfNecessary(symbol: ts.Symbol) {
    if ((symbol.flags & ts.SymbolFlags.Alias) !== 0)
      return checker.getAliasedSymbol(symbol);
    return symbol;
  }

  function collectInterfaceInfo(node: ts.Declaration, symbol: ts.Symbol) {
    if (!ts.isInterfaceDeclaration(node))
      throw new Error(`target is not an InterfaceDeclaration`);

    if (!symbol) throw new Error(`can't find symbol`);

    const name = node.name.getText();
    const documentation = ts.displayPartsToString(
      symbol.getDocumentationComment(checker)
    );

    const propertiesInfo: InterfacePropertyInfo[] = [];

    symbol.members?.forEach((symbol) => {
      const name = symbol.name;
      const declaration = symbol.valueDeclaration;
      if (
        !(
          declaration &&
          (ts.isPropertySignature(declaration) ||
            ts.isMethodSignature(declaration))
        )
      ) {
        throw new Error(
          `unexpected declaration type in interface. name: ${name}, kind: ${
            // @ts-ignore
            ts.SyntaxKind[declaration.kind]
          }`
        );
      }
      const typeText = declaration.type?.getFullText() ?? "";
      const documentation = ts.displayPartsToString(
        symbol.getDocumentationComment(checker)
      );
      const defaultValue = (() => {
        const jsDoc: ts.JSDoc | undefined = (declaration as any).jsDoc?.[0];
        const defaultValueTag = jsDoc?.tags?.find((t) => {
          return (
            t.tagName.escapedText === "defaultValue" ||
            t.tagName.escapedText === "default"
          );
        });
        return defaultValueTag?.comment;
      })();
      propertiesInfo.push({
        name,
        typeText,
        documentation,
        // @ts-ignore
        defaultValue,
      });
    });

    const interfaceInfo: InterfaceInfo = {
      name,
      documentation,
      properties: propertiesInfo,
    };

    return interfaceInfo;
  }
}

/**
 * ref:
 *
 * https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API
 *
 * https://stackoverflow.com/questions/59838013/how-can-i-use-the-ts-compiler-api-to-find-where-a-variable-was-defined-in-anothe
 *
 * https://stackoverflow.com/questions/60249275/typescript-compiler-api-generate-the-full-properties-arborescence-of-a-type-ide
 *
 * https://stackoverflow.com/questions/47429792/is-it-possible-to-get-comments-as-nodes-in-the-ast-using-the-typescript-compiler
 *
 * Instructions of learning ts compiler:
 * https://stackoverflow.com/a/58885450
 *
 * https://learning-notes.mistermicheels.com/javascript/typescript/compiler-api/
 */
