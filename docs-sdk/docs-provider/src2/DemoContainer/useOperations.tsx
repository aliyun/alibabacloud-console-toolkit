import React, { useMemo, useReducer, useEffect, useState } from "react";
import type {
  IDemoOpts,
  IDemoOperation,
} from "@alicloud/console-toolkit-docs-shared";
import "./codemirror.less";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/addon/edit/matchbrackets.js";
import { Controlled as CodeMirror } from "react-codemirror2";
import AnimateHeight from "react-animate-height";

import styles from "./index.scoped.less";
import Codesandbox from "./codesandbox";
import { useEvalCode } from "./useEvalCode";

// @ts-ignore
import buildTimeDemoOpts from "/@demoOpts";
import FullView from "./FullView";

/**
 * demo面板操作栏，比如展示源码、在CodeSandbox打开等
 */
export function useOperations(
  originalCode: string,
  imports: string[],
  meta: any = {},
  opts: IDemoOpts = {},
  demoDeps,
  children: React.ReactNode,
  DemoWrapper: undefined | React.ComponentType<any>,
  loadOpts: any
) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const resolvedOpts = {
    canFullScreen: (() => {
      // 可以通过demo自己的meta注释来定制canFullScreen配置，优先级最高
      if (meta?.canFullScreen !== undefined) {
        return String(meta?.canFullScreen) !== "false" ? true : false;
      }
      return opts.canFullScreen ?? buildTimeDemoOpts.canFullScreen ?? false;
    })() as boolean,
  };

  // 插件可以修改demo代码
  const originalCode2 = useMemo(() => {
    let res = originalCode;
    if (typeof buildTimeDemoOpts.modifyDisplayCode === "function") {
      res = buildTimeDemoOpts.modifyDisplayCode({
        code: res,
        meta,
        imports,
      });
    }
    if (typeof opts.modifyDisplayCode === "function") {
      res = opts.modifyDisplayCode({ code: res, meta, imports });
    }
    return res;
  }, [
    opts.modifyDisplayCode,
    buildTimeDemoOpts.modifyDisplayCode,
    originalCode,
    meta,
    imports,
  ]);

  // 用户可以在源码面板修改demo代码
  const [currentCode, setCurrentCode] = useState(originalCode2);

  // 上游code状态更新时，同步到本组件状态
  useEffect(() => {
    setCurrentCode(originalCode2);
  }, [originalCode2]);

  // 如果用户在操作面板修改过代码，
  // 那么使用EvalCode来实时执行代码
  const { renderEvalCode, transformedCode } = useEvalCode({
    code: currentCode,
    deps: demoDeps,
    enable: currentCode !== originalCode2,
  });

  // 插件可以配置操作栏
  const operations = useMemo(() => {
    let res = defaultOperations;
    // 构建者提供的操作栏配置
    if (typeof buildTimeDemoOpts.extraOperations === "function") {
      res = [
        ...res,
        ...buildTimeDemoOpts.extraOperations({
          code: originalCode2,
          meta,
          imports,
        }),
      ];
    }
    // 加载者提供的操作栏配置
    if (typeof opts.extraOperations === "function") {
      res = [
        ...res,
        ...opts.extraOperations({ code: originalCode2, meta, imports }),
      ];
    }
    const ctx = {
      demoOpts: opts,
      buildTimeDemoOpts,
      demoMeta: meta,
      resolvedOpts,
    };
    return res.filter((operation) => {
      // 操作可以根据上下文信息来决定自己是否开启
      if (typeof operation.enabled === "function") {
        return operation.enabled(ctx);
      }
      return true;
    });
  }, [
    opts.extraOperations,
    buildTimeDemoOpts.extraOperations,
    originalCode2,
    meta,
    imports,
  ]);

  const demoView = (() => {
    // 如果用户在操作面板修改过代码，
    // 那么使用EvalCode来实时执行代码
    // 否则，会fallback到打包的渲染代码
    let ret = renderEvalCode ?? children;
    // 如果用户配置了DemoWrapper，那么要用它包裹一下demo
    if (DemoWrapper) {
      ret = <DemoWrapper>{ret}</DemoWrapper>;
    }
    return ret;
  })();

  const expandPanel = (() => {
    const { operation, height } = (() => {
      if (state.current !== "none") {
        // 有面板操作的时候，且该操作有面板视图
        // 则渲染该面板视图
        const operation = operations.find(
          (item) => item.name === state.current
        );
        return {
          operation,
          height: operation?.View ? "auto" : 0,
        };
      } else {
        // 没有面板操作的时候，渲染上一个操作，撑开操作面板高度
        // 以便高度收起的动画能够进行
        const operation = operations.find(
          (item) => item.name === state.previous
        );
        return {
          operation,
          height: 0,
        };
      }
    })();

    return (
      <AnimateHeight duration={250} height={height}>
        {operation?.View ? (
          <operation.View
            code={currentCode}
            originalCode={originalCode2}
            setCode={setCurrentCode}
            imports={imports}
            meta={meta}
            opts={opts}
          />
        ) : (
          <div />
        )}
      </AnimateHeight>
    );
  })();

  const operationsView = (
    <>
      <div
        className={styles.operations}
        // 用于debug
        data-transformed-code={transformedCode}
      >
        {operations.map(({ icon, name, onClick }) => {
          return (
            <span
              key={name}
              className={styles.operation}
              onClick={() => {
                dispatch(name);
                if (typeof onClick === "function") {
                  onClick();
                }
              }}
            >
              {icon()}
            </span>
          );
        })}
      </div>
      {/* 全屏查看弹窗 */}
      <FullView
        title={meta.title}
        visible={state.current === "full-view"}
        onClose={() => {
          dispatch("full-view");
        }}
      >
        {demoView}
      </FullView>
      {expandPanel}
    </>
  );

  return { demoView, operationsView, resolvedOpts };
}

const defaultOperations: IDemoOperation[] = [
  {
    name: "code",
    icon: () => {
      // 图标来自阿里云控制台图标库
      return (
        <svg
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="9027"
          width="100%"
          height="100%"
        >
          <path
            d="M85.312 164.8v604.8h853.376v-604.8H85.312zM682.688 870.4V960H341.312v-89.6H0V64h1024v806.4h-341.312zM390.08 632.128L128 503.04V422.336l262.08-128.64V390.4L230.784 462.976l159.296 72.832v96.32zM529.6 256H576l-82.048 413.184H448L529.6 256z m104.32 376.128V535.808l159.296-72.832-159.296-72.512V293.632L896 422.4v80.768L633.92 632.128z"
            p-id="9028"
            data-spm-anchor-id="a313x.7781069.0.i1"
          ></path>
        </svg>
      );
    },
    View: ({ code, setCode }) => {
      return (
        <CodeMirror
          value={code}
          className={styles.codemirror}
          options={{
            lineNumbers: true,
            matchBrackets: true,
            mode: "text/typescript",
          }}
          editorDidMount={(editor) => {
            // https://github.com/codemirror/CodeMirror/issues/2469#issuecomment-376064308
            setTimeout(() => {
              editor.refresh();
            }, 10);
          }}
          onBeforeChange={(editor, data, value) => {
            setCode(value);
          }}
        />
      );
    },
  },
  {
    name: "full-view",
    enabled: ({ demoOpts, buildTimeDemoOpts, demoMeta, resolvedOpts }) => {
      return resolvedOpts.canFullScreen;
    },
    icon: () => (
      // 图标库：https://www.iconfont.cn/search/index?searchType=icon&q=expand
      <svg
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="9027"
        width="100%"
        height="100%"
      >
        <path
          d="M725.333333 42.666667l128 0q52.992 0 90.496 37.504t37.504 90.496l0 128q0 17.664-12.501333 30.165333t-30.165333 12.501333-30.165333-12.501333-12.501333-30.165333l0-128q0-17.664-12.501333-30.165333t-30.165333-12.501333l-128 0q-17.664 0-30.165333-12.501333t-12.501333-30.165333 12.501333-30.165333 30.165333-12.501333zM85.333333 682.666667q17.664 0 30.165333 12.501333t12.501333 30.165333l0 128q0 17.664 12.501333 30.165333t30.165333 12.501333l128 0q17.664 0 30.165333 12.501333t12.501333 30.165333-12.501333 30.165333-30.165333 12.501333l-128 0q-52.992 0-90.496-37.504t-37.504-90.496l0-128q0-17.664 12.501333-30.165333t30.165333-12.501333zM170.666667 42.666667l128 0q17.664 0 30.165333 12.501333t12.501333 30.165333-12.501333 30.165333-30.165333 12.501333l-128 0q-17.664 0-30.165333 12.501333t-12.501333 30.165333l0 128q0 17.664-12.501333 30.165333t-30.165333 12.501333-30.165333-12.501333-12.501333-30.165333l0-128q0-52.992 37.504-90.496t90.496-37.504zM938.666667 682.666667q17.664 0 30.165333 12.501333t12.501333 30.165333l0 128q0 52.992-37.504 90.496t-90.496 37.504l-128 0q-17.664 0-30.165333-12.501333t-12.501333-30.165333 12.501333-30.165333 30.165333-12.501333l128 0q17.664 0 30.165333-12.501333t12.501333-30.165333l0-128q0-17.664 12.501333-30.165333t30.165333-12.501333z"
          p-id="11568"
        ></path>
      </svg>
    ),
    // View可以不传，表示点击该操作图标不展开面板
    View: undefined,
  },
  {
    name: "codesandbox",
    icon: () => {
      return (
        <svg
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="9197"
          width="100%"
          height="100%"
        >
          <path
            d="M755 140.3l0.5-0.3h0.3L512 0 268.3 140h-0.3l0.8 0.4L68.6 256v512L512 1024l443.4-256V256L755 140.3z m-30 506.4v171.2L548 920.1V534.7L883.4 341v215.7l-158.4 90z m-584.4-90.6V340.8L476 534.4v385.7L300 818.5V646.7l-159.4-90.6zM511.7 280l171.1-98.3 166.3 96-336.9 194.5-337-194.6 165.7-95.7L511.7 280z"
            p-id="9198"
          ></path>
        </svg>
      );
    },
    View: ({ code, imports, meta, opts }) => {
      return (
        <Codesandbox
          code={code}
          imports={imports}
          meta={meta}
          modifyCodeSandbox={opts.modifyCodeSandbox}
        />
      );
    },
  },
];

const initialState = { current: "none", previous: "none" };

function reducer(
  state: { current: string; previous: string },
  action: string
): { current: string; previous: string } {
  // 第二次点击同一个操作按钮时收起面板
  if (state.current === action) {
    return {
      current: "none",
      previous: state.current,
    };
  }

  return {
    current: action,
    previous: state.current,
  };
}
