/**
 * @title demo2
 * @describe demo2 description.
 * @canFullScreen
 */

import React from "react";

interface IProps {}

const Demo2: React.FC<IProps> = (props) => {
  return (
    <div style={{ border: "1px solid red", width: 1200 }}>
      demo2
      <p>这是一个比较宽的demo，可以通过canFullScreen配置，开启全屏查看</p>
    </div>
  );
};

export default Demo2;
