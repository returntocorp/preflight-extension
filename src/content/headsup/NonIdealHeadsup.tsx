import { Button, Icon, Intent, Spinner } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import * as React from "react";

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
            Preflight coming soon for this language 🛫
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
}

interface ErrorHeadsUpProps {
  error: React.ErrorInfo;
}

export class ErrorHeadsUp extends React.PureComponent<ErrorHeadsUpProps> {
  public state: UnsupportedMessageState = {
    closed: false
  };

  public render() {
    if (this.state.closed) {
      return null;
    }

    return (
      <div className="r2c-repo-headsup error-headsup">
        <div className="error-message">
          <Icon
            icon={IconNames.WARNING_SIGN}
            className="error-icon"
            intent={Intent.DANGER}
          />
          <span className="error-message-text">Couldn't load Preflight</span>
        </div>
      </div>
    );
  }
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
