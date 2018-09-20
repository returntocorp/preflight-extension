import { Button, Icon, Intent, Spinner } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { l } from "@r2c/extension/analytics";
import { MainToaster } from "@r2c/extension/content/Toaster";
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

    return (
      <div className="r2c-repo-headsup unsupported-headsup">
        <div className="unsupported-message">
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
            onClick={this.closeMessage}
          />
        </div>
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
    return (
      <div className="r2c-repo-headsup errror-headsup">
        <div className="error-message">
          <Icon
            icon={IconNames.WARNING_SIGN}
            className="error-icon"
            intent={Intent.DANGER}
          />
          <div className="error-message-text">Couldn't load Preflight</div>
          <div className="error-message-details">
            <Button
              onClick={this.handleToggleShowDetails}
              minimal={true}
              small={true}
              className="error-message-show-more"
            >
              Show {this.state.showDetails ? "less" : "more"}
            </Button>
            {this.state.showDetails && (
              <pre className="error-message-raw">
                {JSON.stringify(this.props.error)}
              </pre>
            )}
          </div>
        </div>
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
      <div className="r2c-repo-headsup loading-headsup">
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
