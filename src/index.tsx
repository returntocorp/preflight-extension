import * as React from "react";
import * as ReactDOM from "react-dom";
import Guide from "./popup";

browser.runtime.setUninstallUrl("https://goo.gl/forms/B8ALNAcRHoLWHBVF2");

ReactDOM.render(<Guide />, document.getElementById(
  "r2c-popup-root"
) as HTMLElement);
