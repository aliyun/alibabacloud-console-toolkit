import React, { useMemo, useReducer } from "react";
import AnimateHeight from "react-animate-height";

import styles from "./index.scoped.less";
import CodeBlock from "./CodeBlock";
import Codesandbox from "./codesandbox";

// @ts-ignore
import buildTimeDemoOpts from "/@demoOpts";

interface IProps {
  meta?: any;
  code: string;
  DemoWrapper?: React.ComponentType<any>;
  imports: string[];
  opts?: IDemoOpts;
  className?: string;
  style?: React.CSSProperties;
}

export interface IOperation {
  name: string;
  icon: () => React.ReactNode;
  View?: React.ComponentType<{
    meta: any;
    code: string;
    imports: string[];
    opts: IDemoOpts;
  }>;
}

const defaultOperations: IOperation[] = [
  {
    name: "code",
    icon: () => {
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
    View: ({ code }) => {
      return (
        <CodeBlock
          language="tsx"
          style={{ borderTop: "1px solid #dedede", padding: 24 }}
        >
          {code}
        </CodeBlock>
      );
    }
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
    }
  }
];

const initialState = { current: "none", previous: "code" };

function reducer(
  state: { current: string; previous: string },
  action: string
): { current: string; previous: string } {
  // 第二次点击同一个操作按钮时收起面板
  if (state.current === action) {
    return {
      current: "none",
      previous: state.current
    };
  }

  return {
    current: action,
    previous: state.current
  };
}

const DemoContainer: React.FC<IProps> = ({
  children,
  code,
  DemoWrapper,
  imports,
  meta = {},
  opts = {},
  className,
  style
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const finalDisplayCode = useMemo(() => {
    let res = code;
    if (typeof buildTimeDemoOpts.modifyDisplayCode === "function") {
      res = buildTimeDemoOpts.modifyDisplayCode({ code, meta, imports });
    }
    if (typeof opts.modifyDisplayCode === "function") {
      res = opts.modifyDisplayCode({ code, meta, imports });
    }
    return res;
  }, [
    opts.modifyDisplayCode,
    buildTimeDemoOpts.modifyDisplayCode,
    code,
    meta,
    imports
  ]);

  // 构建者提供的配置
  const operations = useMemo(() => {
    let res = defaultOperations;
    if (typeof buildTimeDemoOpts.extraOperations === "function") {
      res = [
        ...res,
        ...buildTimeDemoOpts.extraOperations({ code, meta, imports })
      ];
    }
    // 加载者提供的配置
    if (typeof opts.extraOperations === "function") {
      res = [...res, ...opts.extraOperations({ code, meta, imports })];
    }
    return res;
  }, [
    opts.extraOperations,
    buildTimeDemoOpts.extraOperations,
    code,
    meta,
    imports
  ]);

  const operation = (() => {
    if (state.current !== "none") {
      return operations.find(item => item.name === state.current);
    } else {
      // 没有展开操作面板的时候，渲染上一个操作，撑开操作面板高度，以便高度动画能够进行
      return operations.find(item => item.name === state.previous);
    }
  })();
  if (!operation) {
    throw new Error(`can not find demo operation "${state.current}"`);
  }

  return (
    <div
      className={[styles.container, className].filter(Boolean).join(" ")}
      style={style}
    >
      <div className={styles.title}>{meta.title}</div>
      <div className={styles.demo}>
        {DemoWrapper ? <DemoWrapper>{children}</DemoWrapper> : children}
      </div>
      <div className={styles.describe}>{meta.describe || meta.description}</div>
      <div className={styles.operations}>
        {/* 图标来自阿里云控制台图标库 */}
        {operations.map(({ icon, name, View }) => {
          return (
            <span
              key={name}
              className={styles.operation}
              // 如果该操作有面板，则展开面板
              onClick={
                View
                  ? () => {
                      dispatch(name);
                    }
                  : undefined
              }
            >
              {icon()}
            </span>
          );
        })}
      </div>
      <AnimateHeight
        duration={250}
        height={state.current === "none" || !operation.View ? 0 : "auto"}
      >
        {operation.View && (
          <operation.View
            code={finalDisplayCode}
            imports={imports}
            meta={meta}
            opts={opts}
          />
        )}
      </AnimateHeight>
    </div>
  );
};

export default DemoContainer;

export interface IDemoOpts {
  modifyDisplayCode?: (params: {
    code: string;
    meta: any;
    imports: string[];
  }) => string;
  modifyCodeSandbox?: (params: {
    code: string;
    meta: any;
    imports: string[];
    files: ICodeSandboxFiles;
  }) => ICodeSandboxFiles;
  extraOperations?: (params: {
    code: string;
    meta: any;
    imports: string[];
  }) => IOperation[];
}

export interface ICodeSandboxFiles {
  [file: string]: string;
}
