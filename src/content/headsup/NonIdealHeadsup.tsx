import { Button, Icon, Intent, Spinner } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { l } from "@r2c/extension/analytics";
import { MainToaster } from "@r2c/extension/content/Toaster";
import * as classnames from "classnames";
import * as React from "react";
import "./NonIdealHeadsup.css";

interface UnsupportedMessageState {
  closed: boolean;
}

export class UnsupportedHeadsUp extends React.PureComponent<
  {},
  UnsupportedMessageState
> {
  public state: UnsupportedMessageState = {
    closed: false
  };

  public render() {
    if (this.state.closed) {
      return null;
    }

    l("preflight-unsupported-repo-load");

    return (
      <div
        className={classnames(
          "r2c-repo-headsup",
          "nonideal-headsup",
          "unsupported-headsup"
        )}
      >
        <span className="unsupported-message-text">
          🛫 Preflight only covers JavaScript and TypeScript projects at the
          moment. If this project should have Preflight on it,{" "}
          <Button
            rightIcon={IconNames.ENVELOPE}
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
        <Button
          icon={IconNames.SMALL_CROSS}
          minimal={true}
          small={true}
          onClick={this.closeMessage}
        />
      </div>
    );
  }

  private closeMessage: React.MouseEventHandler<HTMLElement> = e => {
    this.setState({ closed: true });
  };

  private handleRequestClick: React.MouseEventHandler<HTMLElement> = e => {
    MainToaster.show({
      message:
        "We've got your message! We'll look into why this project isn't available on Preflight.",
      icon: IconNames.HEART
    });
  };
}

interface ErrorHeadsUpProps {
  error: React.ErrorInfo | Error;
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
              Couldn't load Preflight. Make sure <code>api.secarta.io</code> is
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
            <pre className="error-raw">
              {this.props.error.toString()}
              <br />
              {JSON.stringify(this.props.error)}
            </pre>
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
    closed: false
  };

  public render() {
    if (this.state.closed) {
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
