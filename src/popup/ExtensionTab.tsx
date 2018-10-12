import { FormGroup, Switch } from "@blueprintjs/core";
import {
  ExperimentManifest,
  ExperimentName,
  ExtensionState
} from "@r2c/extension/shared/ExtensionState";
import { getExtensionVersion } from "@r2c/extension/utils";
import * as React from "react";
import { l } from "../analytics";
import "./ExtensionTab.css";

interface ExperimentSwitchProps {
  title: string;
  description: string;
  experiments: ExperimentManifest;
  experimentName: ExperimentName;
  onToggleExperiment(
    experimentName: ExperimentName
  ): React.FormEventHandler<HTMLInputElement>;
}

class ExperimentSwitch extends React.PureComponent<ExperimentSwitchProps> {
  public render() {
    const { title, description, experiments, experimentName } = this.props;

    return (
      <Switch
        labelElement={
          <div className="experiment-label">
            <div className="experiment-label-title">{title}</div>
            <div className="experiment-label-description">{description}</div>
          </div>
        }
        checked={experiments[experimentName]}
        onChange={l(
          `experiment-${experimentName}-toggle`,
          this.props.onToggleExperiment(experimentName)
        )}
      />
    );
  }
}

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
          <ExperimentSwitch
            title="Permission checks"
            description="We'll show capabilities and permissions that we've detected in this project as issues you can interact with."
            experiments={this.props.extensionState.experiments}
            experimentName="permissions"
            onToggleExperiment={this.props.onToggleExperiment}
          />
        </FormGroup>
      </div>
    );
  }
}
