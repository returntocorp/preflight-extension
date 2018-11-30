import { l } from "@r2c/extension/analytics";
import {
  CheckmarkIcon,
  DangerIcon,
  LoadingIcon,
  MissingIcon,
  UnsupportedIcon,
  WarningIcon
} from "@r2c/extension/icons";
import * as classnames from "classnames";
import * as React from "react";
import "./SimpleHeadsup.css";

interface SimpleHeadsupProps {
  isShowing?: boolean;
  onShowAllChecksClick?: React.MouseEventHandler;
  simpleType:
    | "safe"
    | "danger"
    | "warning"
    | "missing"
    | "unsupported"
    | "loading";
}

export default class SimpleHeadsup extends React.PureComponent<
  SimpleHeadsupProps
> {
  public render() {
    const { simpleType, isShowing, onShowAllChecksClick } = this.props;
    const attributes = this.getAttributes(simpleType);
    /* tslint:disable:no-string-literal */
    const headline = attributes["headline"];
    const icon = attributes["icon"];
    const checks = attributes["checks"];
    /* tslint:enable:no-string-literal */
    const simpleStyle = isShowing
      ? "simple-headsup detailed"
      : "simple-headsup";

    return (
      <div
        className={classnames(
          "r2c-repo-headsup",
          `${simpleStyle}`,
          `simple-${simpleType}`
        )}
      >
        <div className="simple-left">
          {icon}
          <div className="simple-headsup-headline">{headline}</div>
        </div>
        {checks && this.renderRight(onShowAllChecksClick, isShowing)}
      </div>
    );
  }

  private renderRight(
    onShowAllChecksClick: React.MouseEventHandler | undefined,
    isShowing: boolean | undefined
  ) {
    return (
      <div className="simple-right">
        <span className="simple-headsup-timestamp">
          Updated 2 weeks ago &middot;{" "}
        </span>
        <span className="simple-headsup-show">
          <a
            onClick={l(
              "preflight-show-checks-button-click",
              onShowAllChecksClick
            )}
            role="button"
          >
            {this.renderShow(isShowing)}
          </a>
        </span>
      </div>
    );
  }

  private getAttributes(simpleType: string) {
    switch (simpleType) {
      case "safe":
        return {
          icon: <CheckmarkIcon />,
          headline: "All Preflight checks pass.",
          checks: true
        };

      case "danger":
        return {
          icon: <DangerIcon />,
          headline: "Add danger headline here.",
          checks: true
        };
      case "warning":
        return {
          icon: <WarningIcon />,
          headline: "Some Preflight checks fail.",
          checks: true
        };
      case "missing":
        return {
          icon: <MissingIcon />,
          headline: "Missing or unknown Preflight data.",
          checks: true
        };
      case "unsupported":
        return {
          icon: <UnsupportedIcon />,
          headline:
            "Preflight currently only supports JavaScript and TypeScript projects that have been published to npm.",
          checks: false
        };
      case "loading":
        return {
          icon: <LoadingIcon />,
          headline: "Loading Preflight data ...",
          checks: false
        };
      default:
        return {
          icon: <MissingIcon />,
          headline: "Missing or unknown Preflight data.",
          checks: false
        };
    }
  }

  private renderShow(isShowing: boolean | undefined) {
    return isShowing ? "Hide all checks" : "Show all checks";
  }
}

// export class SimpleHeadsupWrapper extends React.PureComponent<> {}
interface SimpleHeadsupWrapperProps {
  children: React.ReactChild;
}

interface SimpleHeadsupWrapperState {
  showMore: boolean;
}

export class SimpleHeadsupWrapper extends React.PureComponent<
  SimpleHeadsupWrapperProps,
  SimpleHeadsupWrapperState
> {
  public state: SimpleHeadsupWrapperState = {
    showMore: false
  };

  public render() {
    const { children } = this.props;
    const { showMore } = this.state;

    return (
      <>
        <SimpleHeadsup
          simpleType="safe"
          isShowing={showMore}
          onShowAllChecksClick={this.handleShowAllChecks}
        />
        <div className={!showMore ? "hidden" : ""}>{children}</div>
      </>
    );
  }

  private handleShowAllChecks: React.MouseEventHandler = () =>
    this.setState({ showMore: !this.state.showMore });
}
