import React from "react";
import styles from "./index.scoped.less";

interface IProps {
  entryKeys: string[];
  currentEntryKey?: string;
  onChange?: (newKey: string) => void;
}

const DemoList: React.FC<IProps> = ({
  entryKeys,
  currentEntryKey,
  onChange
}) => {
  return (
    <ul className={styles.list}>
      {entryKeys.map(oneKey => {
        return (
          <li
            className={
              (oneKey === currentEntryKey ? styles.active : "") +
              " " +
              styles.item
            }
            onClick={() => {
              if (typeof onChange === "function") {
                onChange(oneKey);
              }
            }}
            key={oneKey}
          >
            {oneKey}
          </li>
        );
      })}
    </ul>
  );
};

export default DemoList;
