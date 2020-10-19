import React, { useEffect, useReducer, useRef, useState } from "react";
import AnimateHeight from "react-animate-height";

import styles from "./index.scoped.less";
import CodeBlock from "./CodeBlock";
import Codesandbox from "./codesandbox";

interface IProps {
  meta?: any;
  code: string;
  DemoWrapper?: React.ComponentType<any>;
  imports: string[];
}

enum EState {
  none,
  code,
  codesandbox
}

const initialState = { current: EState.none, previous: EState.code };

function reducer(
  state: { current: EState; previous: EState },
  action: EState
): { current: EState; previous: EState } {
  // 第二次点击同一个操作按钮时收起面板
  if (state.current === action)
    return {
      current: EState.none,
      previous: state.current
    };

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
  meta = {}
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const [codesandboxUrl, setUrl] = useState("");

  useEffect(() => {
    // 切换demo的时候，重置 codesandboxUrl
    setUrl("");
  }, [code]);

  const operationBody = (() => {
    const codeJSX = (
      <CodeBlock
        language="tsx"
        style={{ borderTop: "1px solid #dedede", padding: 24 }}
      >
        {code}
      </CodeBlock>
    );
    const codesandboxJSX = (
      <Codesandbox
        codesandboxUrl={codesandboxUrl}
        setUrl={setUrl}
        code={code}
        imports={imports}
        meta={meta}
      />
    );

    if (state.current !== EState.none) {
      switch (state.current) {
        case EState.code:
          return codeJSX;
        case EState.codesandbox:
          return codesandboxJSX;
      }
    } else {
      switch (state.previous) {
        case EState.code:
          return codeJSX;
        case EState.codesandbox:
          return codesandboxJSX;
      }
    }
  })();

  return (
    <div className={styles.container}>
      <div className={styles.title}>{meta.title}</div>
      <div className={styles.demo}>
        {DemoWrapper ? <DemoWrapper>{children}</DemoWrapper> : children}
      </div>
      <div className={styles.describe}>{meta.describe || meta.description}</div>
      <div className={styles.operation}>
        {/* 图标来自阿里云控制台图标库 */}
        <svg
          className={`icon-show-code`}
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="9027"
          width="16"
          height="16"
          onClick={() => dispatch(EState.code)}
        >
          <path
            d="M85.312 164.8v604.8h853.376v-604.8H85.312zM682.688 870.4V960H341.312v-89.6H0V64h1024v806.4h-341.312zM390.08 632.128L128 503.04V422.336l262.08-128.64V390.4L230.784 462.976l159.296 72.832v96.32zM529.6 256H576l-82.048 413.184H448L529.6 256z m104.32 376.128V535.808l159.296-72.832-159.296-72.512V293.632L896 422.4v80.768L633.92 632.128z"
            p-id="9028"
            data-spm-anchor-id="a313x.7781069.0.i1"
          ></path>
        </svg>

        <svg
          className={`icon-show-codesandbox`}
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="9197"
          width="16"
          height="16"
          onClick={() => dispatch(EState.codesandbox)}
        >
          <path
            d="M755 140.3l0.5-0.3h0.3L512 0 268.3 140h-0.3l0.8 0.4L68.6 256v512L512 1024l443.4-256V256L755 140.3z m-30 506.4v171.2L548 920.1V534.7L883.4 341v215.7l-158.4 90z m-584.4-90.6V340.8L476 534.4v385.7L300 818.5V646.7l-159.4-90.6zM511.7 280l171.1-98.3 166.3 96-336.9 194.5-337-194.6 165.7-95.7L511.7 280z"
            p-id="9198"
          ></path>
        </svg>
      </div>
      <AnimateHeight
        duration={250}
        height={state.current === EState.none ? 0 : "auto"}
      >
        {operationBody}
      </AnimateHeight>
    </div>
  );
};

export default DemoContainer;
