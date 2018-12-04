import { Button, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { l, li } from "@r2c/extension/analytics";
import { PreflightChecklistErrors } from "@r2c/extension/content/headsup/PreflightFetch";
import { PreflightProjectState } from "@r2c/extension/content/headsup/PreflightProjectState";
import SimpleHeadsup from "@r2c/extension/content/headsup/SimpleHeadsup";
import { MainToaster } from "@r2c/extension/content/Toaster";
import {
  LoadingIcon,
  MissingIcon,
  UnsupportedIcon
} from "@r2c/extension/icons";
import {
  ExtensionState,
  toggleExtensionExperiment
} from "@r2c/extension/shared/ExtensionState";
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

interface ClosedHeadsupProps {
  extensionState: ExtensionState;
}

export class CloseHeadsup extends React.PureComponent<ClosedHeadsupProps> {
  public state: UnsupportedMessageState = {
    displayed: HeadsupDisplayState.Open
  };
  public render() {
    const { extensionState } = this.props;

    return (
      <>
        {this.state.displayed === HeadsupDisplayState.DisplayOptions && (
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
      </>
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
                status="unsupported"
                icon={<UnsupportedIcon />}
                headline="Preflight currently only supports JavaScript and TypeScript projects that have been published to npm."
                rightSide={<CloseHeadsup extensionState={extensionState} />}
              />
            );
          } else {
            return null;
          }
        }}
      </ExtensionContext.Consumer>
    );
  }
}

export class MissingDataHeadsUp extends React.PureComponent {
  public render() {
    return (
      <SimpleHeadsup
        status="missing"
        icon={<MissingIcon />}
        headline="🛬 Preflight couldn't find any data for this project. We're looking
            into it."
        rightSide={
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
        }
      />
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
      <>
        <SimpleHeadsup
          status="missing"
          icon={<MissingIcon />}
          headline={`
    Couldn't load Preflight. Check that ${<code>api.secarta.io</code>} is
              whitelisted in your browser.`}
          rightSide={this.renderRight(hasError)}
        />
        {this.state.showDetails && (
          <div className="error-details">
            <pre className="error-code">{this.props.projectState}</pre>
            <pre className="error-raw">{JSON.stringify(this.props.error)}</pre>
          </div>
        )}
      </>
    );
  }

  private renderRight(hasError: boolean) {
    if (hasError) {
      return (
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
      );
    } else {
      return <></>;
    }
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
        status="loading"
        icon={<LoadingIcon />}
        headline="Contacting tower ..."
      />
    );
  }
}
