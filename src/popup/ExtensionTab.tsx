import { FormGroup, Switch } from "@blueprintjs/core";
import { l } from "@r2c/extension/analytics";
import {
  ExperimentName,
  ExtensionState
} from "@r2c/extension/shared/ExtensionState";
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

    const { version, experiments } = this.props.extensionState;

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
          <Switch
            labelElement={
              <div className="experiment-label">
                <div className="experiment-label-title">Recon mode</div>
                <div className="experiment-label-description">
                  When looking at code with known issues, we'll highlight the
                  files and line numbers where these issues occur.
                </div>
              </div>
            }
            checked={experiments.recon}
            onChange={l(
              "experiment-recon-toggle",
              this.props.onToggleExperiment("recon")
            )}
          />
          <Switch
            labelElement={
              <div className="experiment-label">
                <div className="experiment-label-title">
                  Preflight checklist
                </div>
                <div className="experiment-label-description">
                  Get an up-front summary of the repository
                </div>
              </div>
            }
            checked={experiments.preflight}
            onChange={l(
              "experiment-preflight-toggle",
              this.props.onToggleExperiment("preflight")
            )}
          />
          <Switch
            labelElement={
              <div className="experiment-label">
                <div className="experiment-label-title">Preflight manifest</div>
                <div className="experiment-label-description">
                  Show details for preflight checks on the sidebar
                </div>
              </div>
            }
            checked={experiments.preflightTwist}
            onChange={l(
              "experiment-preflightTwist-toggle",
              this.props.onToggleExperiment("preflightTwist")
            )}
          />
        </FormGroup>
      </div>
    );
  }
}
