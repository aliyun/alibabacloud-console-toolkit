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
  loadOpts: any;
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
  loadOpts,
  children,
}) => {
  const { demoView, operationsView, resolvedOpts } = useOperations(
    originalCode,
    imports,
    meta,
    opts,
    demoDeps,
    children,
    DemoWrapper,
    loadOpts
  );

  const { canFullScreen } = resolvedOpts;

  return (
    <div
      className={[
        // canFullScreen说明demo可能比较大，因此增加默认宽度
        canFullScreen ? "canFullScreen" : null,
        buildTimeDemoOpts.containerClassName,
        opts.containerClassName,
        styles.container,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...buildTimeDemoOpts.containerStyle,
        ...(opts.containerStyle ?? {}),
        ...style,
      }}
    >
      <div className={styles.title}>{meta.title}</div>
      <div className={styles.demo + " breezr-docs-demo"}>
        <div className={styles.demoInner + " breezr-docs-demoInner"}>
          {demoView}
        </div>
      </div>
      <div className={styles.describe}>{meta.describe || meta.description}</div>
      {operationsView}
    </div>
  );
};

export default DemoContainer;
