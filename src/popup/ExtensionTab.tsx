import { FormGroup } from "@blueprintjs/core";
import {
  ExperimentName,
  ExtensionState
} from "@r2c/extension/shared/ExtensionState";
import { getExtensionVersion } from "@r2c/extension/utils";
import * as React from "react";
import "./ExtensionTab.css";

interface ExtensionTabProps {
  extensionState: ExtensionState | undefined;
  onToggleExperiment(
    experimentName: ExperimentName
  ): React.FormEventHandler<HTMLInputElement>;
}

export default class ExtensionTab extends React.Component<ExtensionTabProps> {
  public render() {
    if (this.props.extensionState == null) {
      return null;
    }

    const version = getExtensionVersion();

    return (
      <div className="extension-panel r2c-guide-panel">
        <h1>R2C Extension</h1>
        {version != null ? (
          <span className="version">Version {version}</span>
        ) : (
          <span className="version-dev">Local development</span>
        )}
        <hr />
        <FormGroup
          label="Experiments"
          helperText="Try out some of our freshest ideas. You may need to refresh the page after toggling these experiments."
          className="extension-experiments-cp"
        >
          <span>
            You're running the latest and greatest - no optional experiments to
            try out today.
          </span>
        </FormGroup>
      </div>
    );
  }
}
