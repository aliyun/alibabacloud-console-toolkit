import "./set-public-path";

import {
  registerExposedModule,
  mount
} from "@alicloud/console-os-react-portal";

import Loader, { entries } from "./Loader";

registerExposedModule("entries", entries);
registerExposedModule("Overview", () => import("./Overview"));
registerExposedModule("Loader", Loader);

export default mount(Loader as any, document.getElementById("app"));
