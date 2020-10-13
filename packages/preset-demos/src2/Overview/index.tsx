import React from "react";
import DemoLoader, { demoKeys } from "../DemoLoader";
import styles from "./index.scoped.less";
import DemoList from "./DemoList";

interface IProps {
  demoKey: string;
  onDemoKeyChange: (newDemoKey: string) => void;
}

const Overview: React.FC<IProps> = ({ demoKey, onDemoKeyChange }) => {
  return (
    <div className={styles.container}>
      <div>
        <DemoList
          demoKeys={demoKeys}
          currentDemoKey={demoKey}
          onChange={(newDemoKey) => {
            onDemoKeyChange(newDemoKey);
          }}
        />
      </div>
      <hr />
      <div className={styles.widgetCtn}>
        <DemoLoader demoId={demoKey} />
      </div>
    </div>
  );
};

export default Overview;
