import "./set-public-path";

import {
  registerExposedModule,
  mount,
} from "@alicloud/console-os-react-portal";

import "./index.less";
// import "@alife/alicloud-components/dist/xconsole.css?fusion-prefix"

import { demoKeys } from "./DemoLoader";
import Host from "./Host";

registerExposedModule("demoKeys", demoKeys);
registerExposedModule("Overview", () => import("./Overview"));

export default mount(
  Host as any,
  document.getElementById("app"),
  "os-example"
);
