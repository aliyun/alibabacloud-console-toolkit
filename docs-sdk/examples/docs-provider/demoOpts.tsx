import React from "react";
import { IDemoOpts } from "@alicloud/console-toolkit-preset-docs";

export default {
  extraOperations({ code, meta, imports }) {
    console.log("meta", meta);
    if (meta.myCustomOperation) {
      return [
        {
          name: "test-op",
          icon: () => (
            // 图标库：https://www.iconfont.cn/manage/index?manage_type=myprojects&projectId=705049&keyword=&project_type=&page=
            <svg
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="9027"
              width="100%"
              height="100%"
              onClick={() => {
                console.log(meta.myCustomOperation);
              }}
            >
              <path
                d="M384 960c-47.104 0-85.312-36.48-85.312-81.472S336.896 797.12 384 797.12s85.312 36.48 85.312 81.408C469.312 923.52 431.104 960 384 960z m426.688 0c-47.168 0-85.376-36.48-85.376-81.472s38.208-81.408 85.376-81.408c47.104 0 85.312 36.48 85.312 81.408C896 923.52 857.792 960 810.688 960zM262.272 186.24H1024l-91.968 407.232h-577.92l13.12 58.56h554.112l-18.56 81.408H298.24l-31.552-139.968h-0.256l-59.52-265.6-41.152-182.4H0V64h234.752l27.52 122.24z m18.368 81.408L335.68 512h527.424l55.232-244.352H280.64z"
                fill="#000000"
                p-id="9028"
              ></path>
            </svg>
          ),
          // View可以不传，表示点击该操作图标不展开面板
          View: undefined,
        },
      ];
    } else {
      return [];
    }
  },
  // 可以自定义demo容器的类名和样式
  containerClassName: "testContainerClassName",
  containerStyle: {
    // width: 400,
  },
  // canFullScreen为true时，demo容器默认宽度会增加，并且用户可以全屏查看demo
  // canFullScreen: true,
} as IDemoOpts;
