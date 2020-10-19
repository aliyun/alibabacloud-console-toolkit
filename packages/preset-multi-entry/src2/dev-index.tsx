import "./set-public-path";

import {
  registerExposedModule,
  mount
} from "@alicloud/console-os-react-portal";

import Loader, { entries } from "./Loader";
import Host from "./Host";

registerExposedModule("entries", entries);
registerExposedModule("Overview", () => import("./Overview"));
registerExposedModule("Loader", Loader);

export default mount(Host as any, document.getElementById("app"));
