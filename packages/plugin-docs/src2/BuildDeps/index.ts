// @ts-ignore
import deps from "/@externaled-deps";

import {
  registerExposedModule,
  mount
} from "@alicloud/console-os-react-portal";

registerExposedModule("deps", deps);

export default mount(() => null, document.getElementById("app"));
