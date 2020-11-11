import React from "react";
import Loader, { entries } from "../Loader";
import styles from "./index.scoped.less";
import DemoList from "./DemoList";

import type { IOverviewProps } from "@alicloud/console-toolkit-docs-shared";

const entryKeys = entries.map(({ key }) => key);

const Overview: React.FC<IOverviewProps> = ({
  entryKey,
  onEntryKeyChange,
  ...restLoaderProps
}) => {
  return (
    <div className={styles.container}>
      <DemoList
        entryKeys={entryKeys}
        currentEntryKey={entryKey}
        onChange={onEntryKeyChange}
      />
      <hr />
      {entryKey && (
        <div className={styles.widgetCtn}>
          <Loader {...restLoaderProps} key={entryKey} entryKey={entryKey} />
        </div>
      )}
    </div>
  );
};

export default Overview;
