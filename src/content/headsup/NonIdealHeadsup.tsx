import { Button, Icon, Intent, Spinner } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { l, li } from "@r2c/extension/analytics";
import { PreflightChecklistErrors } from "@r2c/extension/content/headsup/PreflightFetch";
import { PreflightProjectState } from "@r2c/extension/content/headsup/PreflightProjectState";
import { MainToaster } from "@r2c/extension/content/Toaster";
import {
  ExtensionState,
  toggleExtensionExperiment
} from "@r2c/extension/shared/ExtensionState";
import * as classnames from "classnames";
import * as React from "react";
import { ExtensionContext } from "../index";
import "./NonIdealHeadsup.css";

enum HeadsupDisplayState {
  Open,
  DisplayOptions,
  Closed
}

interface UnsupportedMessageState {
  displayed: HeadsupDisplayState;
}

export class UnsupportedHeadsUp extends React.PureComponent<
  {},
  UnsupportedMessageState
> {
  public state: UnsupportedMessageState = {
    displayed: HeadsupDisplayState.Open
  };

  public render() {
    if (this.state.displayed === HeadsupDisplayState.Closed) {
      return null;
    }
    li("preflight-unsupported-repo-load");

    return (
      <ExtensionContext.Consumer>
        {({ extensionState }) => {
          if (
            extensionState != null &&
            !extensionState.experiments.hideOnUnsupported
          ) {
            return (
              <div
                className={classnames(
                  "r2c-repo-headsup",
                  "nonideal-headsup",
                  "unsupported-headsup"
                )}
              >
                {this.state.displayed ===
                  HeadsupDisplayState.DisplayOptions && (
                  <span className="hide-options">
                    <Button
                      id="hide-always-button"
                      minimal={true}
                      small={true}
                      onClick={l(
                        "preflight-hide-always-click",
                        this.handleDismissAlways(extensionState)
                      )}
                      intent={Intent.DANGER}
                    >
                      Always hide if unsupported
                    </Button>
                  </span>
                )}

                {this.state.displayed === HeadsupDisplayState.Open && (
                  <span className="unsupported-message-text">
                    🛫 Preflight couldn't find results or npm packages
                    associated with this repository. If this seems in error,
                    please{" "}
                    <Button
                      id="unsupported-message-request-button"
                      rightIcon={IconNames.FLAG}
                      minimal={true}
                      small={true}
                      onClick={l(
                        "preflight-unsupported-request-click",
                        this.handleRequestClick
                      )}
                      intent={Intent.SUCCESS}
                    >
                      let us know!
                    </Button>
                  </span>
                )}

                <Button
                  icon={IconNames.SMALL_CROSS}
                  minimal={true}
                  small={true}
                  onClick={this.closeMessage}
                />
              </div>
            );
          } else {
            return null;
          }
        }}
      </ExtensionContext.Consumer>
    );
  }

  private closeMessage: React.MouseEventHandler<HTMLElement> = e => {
    if (this.state.displayed === HeadsupDisplayState.DisplayOptions) {
      this.setState({ displayed: HeadsupDisplayState.Closed });
    } else {
      this.setState({ displayed: HeadsupDisplayState.DisplayOptions });
    }
  };

  private handleRequestClick: React.MouseEventHandler<HTMLElement> = e => {
    MainToaster.show({
      message:
        "We've got your message! We'll look into why this project isn't available on Preflight.",
      icon: IconNames.HEART
    });
  };

  private handleDismissAlways: (
    extensionState: ExtensionState
  ) => React.MouseEventHandler<HTMLElement> = extensionState => e => {
    toggleExtensionExperiment(extensionState, "hideOnUnsupported");
    this.setState({ displayed: HeadsupDisplayState.Closed });
  };
}

interface ErrorHeadsUpProps {
  projectState: PreflightProjectState;
  error: PreflightChecklistErrors | Error | React.ErrorInfo | string;
}

interface ErrorHeadsUpState {
  showDetails: boolean;
}

export class ErrorHeadsUp extends React.PureComponent<
  ErrorHeadsUpProps,
  ErrorHeadsUpState
> {
  public state: ErrorHeadsUpState = {
    showDetails: false
  };

  public render() {
    const hasError = Object.getOwnPropertyNames(this.props.error).length > 0;

    return (
      <div
        className={classnames(
          "r2c-repo-headsup",
          "nonideal-headsup",
          "error-headsup"
        )}
      >
        <div className="error-briefing">
          <div className="error-briefing-message">
            <Icon
              icon={IconNames.WARNING_SIGN}
              className="error-icon"
              intent={Intent.DANGER}
            />
            <div className="error-message-text">
              Couldn't load Preflight. Check that <code>api.secarta.io</code> is
              whitelisted in your browser.
            </div>
          </div>
          {hasError && (
            <div className="error-briefing-action">
              <Button
                onClick={this.handleToggleShowDetails}
                className="error-message-show-more"
                small={true}
                minimal={true}
              >
                Show {this.state.showDetails ? "less" : "details"}
              </Button>
            </div>
          )}
        </div>
        {this.state.showDetails && (
          <div className="error-details">
            <pre className="error-code">{this.props.projectState}</pre>
            <pre className="error-raw">{JSON.stringify(this.props.error)}</pre>
          </div>
        )}
      </div>
    );
  }

  private handleToggleShowDetails: React.MouseEventHandler<HTMLElement> = e =>
    this.setState({ showDetails: !this.state.showDetails });
}

export class LoadingHeadsUp extends React.PureComponent {
  public state: UnsupportedMessageState = {
    displayed: HeadsupDisplayState.Open
  };

  public render() {
    if (this.state.displayed === HeadsupDisplayState.Closed) {
      return null;
    }

    return (
      <div
        className={classnames(
          "r2c-repo-headsup",
          "nonideal-headsup",
          "loading-headsup"
        )}
      >
        <div className="loading-message">
          <Spinner
            size={Spinner.SIZE_SMALL}
            className="loading-headsup-spinner"
          />
          <span className="loading-message-text">Contacting tower...</span>
        </div>
      </div>
    );
  }
}
