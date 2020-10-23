import React from "react";
import Loader, { entries } from "../Loader";
import styles from "./index.scoped.less";
import DemoList from "./DemoList";

interface IProps {
  entryKey: string;
  onEntryKeyChange: (newkey: string) => void;
}

const entryKeys = entries.map(({ key }) => key);

const Overview: React.FC<IProps> = ({ entryKey, onEntryKeyChange }) => {
  return (
    <div className={styles.container}>
      <div>
        <DemoList
          entryKeys={entryKeys}
          currentEntryKey={entryKey}
          onChange={onEntryKeyChange}
        />
      </div>
      <hr />
      <div className={styles.widgetCtn}>
        <Loader entryKey={entryKey} markdownOpts={{ toc: true }} />
      </div>
    </div>
  );
};

export default Overview;
