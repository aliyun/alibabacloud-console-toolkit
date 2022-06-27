import React, { useEffect, useLayoutEffect, useState } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

// @ts-ignore
import * as externaledDeps from "@breezr-doc-internals/externaled-deps";

interface IOpts {
  code: string;
  deps: any;
  enable: boolean;
}

// 如果你的站点包含用户的敏感信息（比如cookie），那么不要用这个方法来eval**未知来源**的代码，以免XSS攻击。
// eval当前用户自己提供的代码是可以的；但是不要在A用户访问站点的时候eval B用户提供的代码。
export function useEvalCode({ code, deps: demoDeps, enable }: IOpts) {
  const [transformedCode, setTransformedCode] = useState("");
  const [evaluated, setEvaluated] = useState<any>({});

  useEffect(() => {
    if (!enable) return;
    setTransformedCode("");
    setEvaluated({});
    Promise.all([
      import("@babel/standalone"),
    ]).then(
      ([
        babel,
      ]) => {
        const res = babel
          .transform(code, {
            presets: [
              [
                'typescript',
                {
                  isTSX: true,
                  allExtensions: true,
                },
              ],
            ],

            plugins: ['transform-modules-amd', 'transform-react-jsx'],
          })
          
          if (typeof res?.code === "string") {
            setTransformedCode(res.code);
          }
      }
    );
  }, [code, enable]);

  useLayoutEffect(() => {
    if (!enable) return;

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
      const depsValue = depsArr.map((depName) => {
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
  }, [transformedCode, demoDeps, enable]);

  const renderEvalCode = evaluated.default ? (
    <WrapEvaledComponent retryKey={evaluated.default}>
      <evaluated.default />
    </WrapEvaledComponent>
  ) : null;

  return { value: evaluated, transformedCode, renderEvalCode };
}

const WrapEvaledComponent: React.FC<{ retryKey: any }> = ({
  children,
  retryKey,
}) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[retryKey]}>
      {children}
    </ErrorBoundary>
  );
};

function ErrorFallback({ error }: FallbackProps) {
  return (
    <div role="alert">
      <p>Error in demo:</p>
      {error && <pre>{error.message}</pre>}
    </div>
  );
}
