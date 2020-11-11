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
  deps: any;
}

// 如果你的站点包含用户的敏感信息（比如cookie），那么不要用这个方法来eval**未知来源**的代码，以免XSS攻击。
// eval当前用户自己提供的代码是可以的；但是不要在A用户访问站点的时候eval B用户提供的代码。
export function useEvalCode({ code, deps: demoDeps }: IOpts) {
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
      const deps = { ...externaledDeps, ...demoDeps };
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
