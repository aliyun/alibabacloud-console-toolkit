import { parseAsync } from "@babel/core";
import { ImportDeclaration, Statement } from "@babel/types";

function isImportNode(node: Statement): node is ImportDeclaration {
  return node.type === "ImportDeclaration";
}

export default async function demoInfoLoader(this: any, content: string) {
  const callback = this.async();
  const ast = await parseAsync(content, {
    presets: [
      ["@babel/preset-typescript", { isTSX: true, allExtensions: true }]
    ]
  });

  if (!ast || ast.type !== "File") {
    throw new Error(`unexpected content`);
  }

  // 在运行时创建codesandbox时需要imports的信息
  const imports = ast.program.body.filter(isImportNode).map(node => {
    return node.source.value;
  });

  // 在eval时需要imports的信息
  let importCodeLines: string[] = [];
  let objectPropertyCodeLines: string[] = [];
  imports.forEach((importName, idx) => {
    importCodeLines.push(`import * as _dep${idx} from "${importName}";`);
    objectPropertyCodeLines.push(`"${importName}": _dep${idx},`);
  });

  callback(
    null,
    `export const imports = ${JSON.stringify(imports)};
    export const code = ${JSON.stringify(content)};

    ${importCodeLines.join("\n")}
    export const deps = {
      ${objectPropertyCodeLines.join("\n")}
    };
    `,
    null,
    null
  );
}
