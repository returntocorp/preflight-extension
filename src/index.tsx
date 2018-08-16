import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import registerServiceWorker from "./registerServiceWorker";

const extensionRoot = document.createElement("div");
extensionRoot.id = "r2c-extension-root";
document.body.insertBefore(extensionRoot, document.body.childNodes[0]);

ReactDOM.render(<App />, document.getElementById(
  "r2c-extension-root"
) as HTMLElement);
registerServiceWorker();
