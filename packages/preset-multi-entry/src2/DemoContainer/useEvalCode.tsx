import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import * as babel from "@babel/core";
import babelTs from "@babel/preset-typescript";
import babelAmd from "@babel/plugin-transform-modules-amd";
import babelJSX from "@babel/plugin-transform-react-jsx";
// import babelDynamicImport from "@babel/plugin-proposal-dynamic-import";

// @ts-ignore
import * as externaledDeps from "@breezr-doc-internals/externaled-deps";

interface IOpts {
  code: string;
}

export function useEvalCode({ code }: IOpts) {
  const [transformedCode, setTransformedCode] = useState("");
  const [evaluated, setEvaluated] = useState<any>({});

  useEffect(() => {
    babel
      .transformAsync(code, {
        presets: [
          [
            babelTs,
            {
              isTSX: true,
              allExtensions: true
            }
          ]
        ],

        plugins: [babelJSX, babelAmd]
      })
      .then(res => {
        if (typeof res?.code === "string") {
          setTransformedCode(res.code);
        }
      });
  }, [code]);

  useLayoutEffect(() => {
    const exports: any = {};

    try {
      const fn = new Function("define", transformedCode);
      fn(define);
      setEvaluated(exports);
    } catch (error) {
      console.error("error when eval code:");
      console.error(error);
    }

    function define(depsArr, factory) {
      const deps = externaledDeps;
      const depsValue = depsArr.map(depName => {
        if (depName === "exports") {
          return exports;
        }
        if (deps && deps.hasOwnProperty(depName)) {
          return deps[depName];
        }
        throw new Error(`can not find dependency "${depName}"`);
      });
      factory(...depsValue);
    }
  }, [transformedCode]);

  return { value: evaluated, transformedCode };
}
