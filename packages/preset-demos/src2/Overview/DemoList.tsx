import React from "react"
import styles from "./index.scoped.less"

interface IProps {
  demoKeys: string[]
  currentDemoKey: string
  onChange: (newKey: string) => void
}

const DemoList: React.FC<IProps> = ({ demoKeys, currentDemoKey, onChange }) => {
  return (
    <div>
      <p>选择要查看的 XConsole demo：</p>
      <ul className={styles.list}>
        {demoKeys.map((demoKey) => {
          return (
            <li
              className={
                (demoKey === currentDemoKey ? styles.active : "") +
                " " +
                styles.item
              }
              onClick={() => {
                onChange(demoKey)
              }}
              key={demoKey}
            >
              {demoKey}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default DemoList
