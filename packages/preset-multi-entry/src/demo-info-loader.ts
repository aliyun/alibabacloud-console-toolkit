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

  const imports = ast.program.body.filter(isImportNode).map(node => {
    return node.source.value;
  });

  callback(
    null,
    `export const imports = ${JSON.stringify(imports)};
    export const code = ${JSON.stringify(content)};
    `,
    null,
    null
  );
}
