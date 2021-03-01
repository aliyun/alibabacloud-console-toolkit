import React from "react";

import styles from "./index.scoped.less";
import type { IDemoOpts } from "@alicloud/console-toolkit-docs-shared";

// @ts-ignore
import buildTimeDemoOpts from "/@demoOpts";
import { useOperations } from "./useOperations";

interface IProps {
  meta?: any;
  code: string;
  DemoWrapper?: React.ComponentType<any>;
  imports: string[];
  opts?: IDemoOpts;
  className?: string;
  style?: React.CSSProperties;
  demoDeps: any;
}

const DemoContainer: React.FC<IProps> = ({
  code: originalCode,
  DemoWrapper,
  imports,
  meta = {},
  opts = {},
  className,
  style,
  demoDeps,
  children,
}) => {
  const { renderEvalCode, operationsView } = useOperations(
    originalCode,
    imports,
    meta,
    opts,
    demoDeps
  );

  // 如果用户在操作面板修改过代码，
  // 那么使用EvalCode来实时执行代码
  // 否则，会fallback到打包的渲染代码
  const demoView = renderEvalCode ?? children;

  return (
    <div
      className={[
        buildTimeDemoOpts.containerClassName,
        styles.container,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...buildTimeDemoOpts.containerStyle,
        ...style,
      }}
    >
      <div className={styles.title}>{meta.title}</div>
      <div className={styles.demo}>
        {DemoWrapper ? <DemoWrapper>{demoView}</DemoWrapper> : demoView}
      </div>
      <div className={styles.describe}>{meta.describe || meta.description}</div>
      {operationsView}
    </div>
  );
};

export default DemoContainer;
