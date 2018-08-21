import { getExtensionVersion } from "@r2c/extension/utils";
import * as React from "react";

class Guide extends React.Component {
  public render() {
    return (
      <div className="r2c-guide">
        R2C Extension, version {getExtensionVersion()}
      </div>
    );
  }
}

export default Guide;
