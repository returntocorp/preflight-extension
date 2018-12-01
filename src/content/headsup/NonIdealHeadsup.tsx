import { Button, Icon, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { l, li } from "@r2c/extension/analytics";
import { PreflightChecklistErrors } from "@r2c/extension/content/headsup/PreflightFetch";
import { PreflightProjectState } from "@r2c/extension/content/headsup/PreflightProjectState";
import SimpleHeadsup from "@r2c/extension/content/headsup/SimpleHeadsup";
import { MainToaster } from "@r2c/extension/content/Toaster";
import { LoadingIcon, UnsupportedIcon } from "@r2c/extension/icons";
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
              <SimpleHeadsup
                isExpanded={false}
                status="unsupported"
                icon={<UnsupportedIcon />}
                headline="Preflight currently only supports JavaScript and TypeScript projects that have been published to npm."
                handleClickChecksButton={undefined}
                showAllChecksButton={false}
                rightSide={
                  <React.Fragment>
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

                    <Button
                      icon={IconNames.SMALL_CROSS}
                      minimal={true}
                      small={true}
                      onClick={this.closeMessage}
                    />
                  </React.Fragment>
                }
              />
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

  private handleDismissAlways: (
    extensionState: ExtensionState
  ) => React.MouseEventHandler<HTMLElement> = extensionState => e => {
    toggleExtensionExperiment(extensionState, "hideOnUnsupported");
    this.setState({ displayed: HeadsupDisplayState.Closed });
  };
}

export class MissingDataHeadsUp extends React.PureComponent {
  public render() {
    return (
      <div
        className={classnames(
          "r2c-repo-headsup",
          "nonideal-headsup",
          "missing-data-headsup"
        )}
        onLoad={l("preflight-missing-data-repo-load")} // TODO event bugfix
      >
        <span
          className={classnames(
            "missing-data-message-text",
            "headsup-inline-message"
          )}
        >
          🛬 Preflight couldn't find any data for this project. We're looking
          into it.
          <Button
            rightIcon={IconNames.AIRPLANE}
            className="missing-data-request-button"
            minimal={true}
            small={true}
            onClick={l(
              "preflight-unsupported-request-click",
              this.handleRequestClick
            )}
            intent={Intent.SUCCESS}
          >
            Give us a boost!
          </Button>
        </span>
      </div>
    );
  }

  private handleRequestClick: React.MouseEventHandler<HTMLElement> = e => {
    MainToaster.show({
      message:
        "We've got your message! We'll look into why this project isn't available on Preflight.",
      icon: IconNames.HEART
    });
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
      <SimpleHeadsup
        isExpanded={false}
        status="loading"
        icon={<LoadingIcon />}
        headline="Contacting tower ..."
        handleClickChecksButton={undefined}
        showAllChecksButton={false}
      />
    );
  }
}
