export async function createCodesandbox({
  code,
  imports,
  modifyCode
}: {
  code: string;
  imports: string[];
  modifyCode: (files: CSBFiles) => CSBFiles;
}) {
  const deps = imports
    // filter out relative import
    .filter(path => !path.startsWith("."))
    .reduce((acc, cur) => {
      acc[cur] = "latest";
      return acc;
    }, {});

  let codesandboxProject = codesandboxProjectCode({
    mainCode: code,
    deps: deps
  });
  codesandboxProject = modifyCode(codesandboxProject);

  const files: { [name: string]: { content: string } } = Object.fromEntries(
    Object.entries(codesandboxProject).map(([name, code]) => [
      name,
      { content: code }
    ])
  );

  return fetch("https://codesandbox.io/api/v1/sandboxes/define?json=1", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      files
    })
  })
    .then(x => x.json())
    .then(({ sandbox_id }) => ({
      sandboxId: sandbox_id as string,
      url: `https://codesandbox.io/embed/${sandbox_id}?fontsize=14&codemirror=1&view=split&module=/src/main.tsx`
    }));
}

export default createCodesandbox;

function codesandboxProjectCode({
  mainCode,
  deps
}: {
  mainCode: string;
  deps: { [name: string]: string };
}): CSBFiles {
  const pkgJson = {
    name: "demo",
    main: "index.html",
    dependencies: {
      react: "latest",
      "react-dom": "latest",
      ...deps
    }
  };

  return {
    "tsconfig.json": JSON.stringify(
      {
        compilerOptions: {
          strict: true,
          module: "commonjs",
          jsx: "react",
          esModuleInterop: true,
          sourceMap: true,
          allowJs: true,
          lib: ["es6", "dom"],
          rootDir: "src",
          moduleResolution: "node"
        }
      },
      null,
      2
    ),
    "sandbox.config.json": JSON.stringify(
      {
        infiniteLoopProtection: true,
        hardReloadOnChange: false,
        template: "parcel"
      },
      null,
      2
    ),
    "package.json": JSON.stringify(pkgJson, null, 2),
    "index.html": `
<html>
  <head>
    <title>Demo</title>
    <meta charset="UTF-8" />
  </head>
  <body>
    <div id="app"></div>
    <script src="src/bootstrap.tsx"></script>
  </body>
</html>
  `.trim(),
    "src/main.tsx": mainCode,
    "src/bootstrap.tsx": `
import * as React from 'react'
import { render } from 'react-dom'
import App from './main'

const rootElement = document.getElementById('app')
render(<App />, rootElement)
    `
  };
}

type CSBFiles = {
  [file: string]: string;
};
