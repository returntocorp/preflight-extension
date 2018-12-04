import { l } from "@r2c/extension/analytics";
import { CriteriaEntry } from "@r2c/extension/api/criteria";
import {
  CheckmarkIcon,
  DangerIcon,
  MissingIcon,
  WarningIcon
} from "@r2c/extension/icons";
import { MarkdownString } from "@r2c/extension/utils";
import * as classnames from "classnames";
import * as React from "react";
import * as Markdown from "react-markdown";
import "./SimpleHeadsup.css";

interface SimpleHeadsupProps {
  isExpanded?: boolean;
  status: "safe" | "danger" | "warning" | "missing" | "unsupported" | "loading";
  icon: React.ReactChild;
  headline: string | MarkdownString;
  rightSide?: React.ReactChild;
}

export default class SimpleHeadsup extends React.PureComponent<
  SimpleHeadsupProps
> {
  public render() {
    const { isExpanded, status, icon, headline, rightSide } = this.props;

    const simpleStyle = isExpanded
      ? "simple-headsup detailed-headsup-open"
      : "simple-headsup";

    return (
      <div
        className={classnames(
          "r2c-repo-headsup",
          `${simpleStyle}`,
          `preflight-${status}`
        )}
      >
        <div className="simple-left">
          {icon}
          <Markdown source={headline} className="simple-headsup-headline" />
        </div>
        <div className="simple-right">{rightSide}</div>
      </div>
    );
  }
}

interface SimpleHeadsUpCriteriaWrapperProps {
  criteria: CriteriaEntry;
  handleClickChecksButton?: React.MouseEventHandler;
  showAllChecksButton: boolean;
}

export class SimpleHeadsUpCriteriaWrapper extends React.PureComponent<
  SimpleHeadsUpCriteriaWrapperProps
> {
  public render() {
    const { override, rating } = this.props.criteria;
    const { handleClickChecksButton, showAllChecksButton } = this.props;

    if (override && rating === "danger") {
      const { headline } = override;

      return (
        <SimpleHeadsup
          status={rating}
          icon={<DangerIcon />}
          headline={headline}
          rightSide={this.renderRight(
            handleClickChecksButton,
            showAllChecksButton
          )}
        />
      );
    }

    return (
      <SimpleHeadsup
        status={rating}
        icon={this.renderStatus(rating)[0]}
        headline={this.renderStatus(rating)[1]}
        rightSide={this.renderRight(
          handleClickChecksButton,
          showAllChecksButton
        )}
      />
    );
  }

  private renderRight(
    handleClickChecksButton: React.MouseEventHandler | undefined,
    isExpanded: boolean | undefined
  ) {
    return (
      <React.Fragment>
        <span className="simple-headsup-timestamp">
          Updated 2 weeks ago &middot;{" "}
        </span>
        <span className="simple-headsup-show">
          <a
            onClick={l(
              "preflight-show-checks-button-click",
              handleClickChecksButton
            )}
            role="button"
          >
            {this.renderShow(isExpanded)}
          </a>
        </span>
      </React.Fragment>
    );
  }

  private renderShow(isExpanded: boolean | undefined) {
    return isExpanded ? "Hide all checks" : "Show all checks";
  }

  private renderStatus(status: string): [React.ReactChild, string] {
    switch (status) {
      case "safe":
        return [<CheckmarkIcon key={0} />, "All Preflight checks pass."];
      case "warning":
        return [<WarningIcon key={0} />, "Some Preflight checks fail."];
      default:
        return [
          <MissingIcon key={0} />,
          "There's been an error fetching criteria"
        ];
    }
  }
}

interface SimpleHeadsupDetailsWrapperProps {
  criteria: CriteriaEntry;
  handleClickChecksButton?: React.MouseEventHandler;
  showAllChecksButton: boolean;
  children: React.ReactChild;
}

interface SimpleHeadsupDetailsWrapperState {
  showMore: boolean;
}

export class SimpleHeadsupDetailsWrapper extends React.PureComponent<
  SimpleHeadsupDetailsWrapperProps,
  SimpleHeadsupDetailsWrapperState
> {
  public state: SimpleHeadsupDetailsWrapperState = {
    showMore: false
  };

  public render() {
    const { criteria, children } = this.props;
    const { showMore } = this.state;

    return (
      <>
        <SimpleHeadsUpCriteriaWrapper
          criteria={criteria}
          showAllChecksButton={showMore}
          handleClickChecksButton={this.handleShowAllChecks}
        />
        <div className={!showMore ? "simple-headsup-hidden" : ""}>
          {children}
        </div>
      </>
    );
  }

  private handleShowAllChecks: React.MouseEventHandler = () =>
    this.setState({ showMore: !this.state.showMore });
}
