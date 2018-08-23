import { FocusStyleManager } from "@blueprintjs/core";
import * as React from "react";
import * as ReactDOM from "react-dom";
import Guide from "./popup";

FocusStyleManager.onlyShowFocusOnTabs();

ReactDOM.render(<Guide />, document.getElementById(
  "r2c-popup-root"
) as HTMLElement);
