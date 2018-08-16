import * as React from "react";
import * as ReactDOM from "react-dom";
import "./index.css";

if (document.getElementById("r2c-popup-root") == null) {
  const extensionRoot = document.createElement("div");
  extensionRoot.id = "r2c-extension-root";
  document.body.insertBefore(extensionRoot, document.body.childNodes[0]);

  ReactDOM.render(
    <div className="content-script">Hello from Palo Alto</div>,
    document.getElementById("r2c-extension-root") as HTMLElement
  );
}
