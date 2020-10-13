import "./set-public-path";

import {
  registerExposedModule,
  mount,
} from "@alicloud/console-os-react-portal";

import DemoLoader, { demoKeys } from "./DemoLoader";

registerExposedModule("demoKeys", demoKeys);
registerExposedModule("Overview", () => import("./Overview"));
registerExposedModule("DemoLoader", DemoLoader);

export default mount(DemoLoader as any, document.getElementById("app"));
