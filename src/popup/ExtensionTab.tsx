import { getExtensionVersion } from "@r2c/extension/utils";
import * as React from "react";
import "./ExtensionTab.css";

export default class ExtensionTab extends React.Component {
  public render() {
    const version = getExtensionVersion();

    return (
      <div className="extension-panel r2c-guide-panel">
        <h1>R2C Extension</h1>
        {version != null ? (
          <span className="version">Version {version}</span>
        ) : (
          <span className="version-dev">Local development</span>
        )}
      </div>
    );
  }
}
