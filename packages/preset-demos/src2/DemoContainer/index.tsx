import React from "react";
// import { Icon } from "@alife/alicloud-components";

import styles from "./index.scoped.less";

interface IProps {
  title: React.ReactNode;
  code: string;
  describe: React.ReactNode;
  DemoWrapper?: React.ComponentType<any>;
}

const DemoContainer: React.FC<IProps> = ({
  title,
  children,
  describe,
  code,
  DemoWrapper
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      <div className={styles.demo}>
        {DemoWrapper ? <DemoWrapper>{children}</DemoWrapper> : children}
      </div>
      <div className={styles.describe}>{describe}</div>
      <div className={styles.operation}>
        {/* <Icon type="display-code" size="small" />
        <Icon type="copy" size="small" /> */}
      </div>
      <pre className={styles.code}>{code}</pre>
    </div>
  );
};

export default DemoContainer;
