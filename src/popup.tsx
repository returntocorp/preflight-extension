import { FocusStyleManager } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import Guide from "./popup/index";

FocusStyleManager.onlyShowFocusOnTabs();

const popup = document.getElementById("r2c-popup-root") as HTMLElement;

if (popup != null) {
  ReactDOM.render(<Guide />, popup);
}
