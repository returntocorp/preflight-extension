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
import "./SimpleHeadsup.css";

interface SimpleHeadsupProps {
  isExpanded?: boolean;
  status: "safe" | "danger" | "warning" | "missing" | "unsupported" | "loading";
  icon: React.ReactChild;
  headline: string | MarkdownString;
  handleClickChecksButton?: React.MouseEventHandler;
  showAllChecksButton: boolean;
  rightSide?: React.ReactChild;
}

export default class SimpleHeadsup extends React.PureComponent<
  SimpleHeadsupProps
> {
  public render() {
    const {
      isExpanded,
      icon,
      headline,
      handleClickChecksButton,
      showAllChecksButton,
      rightSide
    } = this.props;

    const simpleStyle = isExpanded
      ? "simple-headsup detailed-headsup-open"
      : "simple-headsup";

    return (
      <div className={classnames("r2c-repo-headsup", `${simpleStyle}`)}>
        <div className="simple-left">
          {icon}
          <div className="simple-headsup-headline">{headline}</div>
        </div>
        <div className="simple-right">
          {showAllChecksButton
            ? this.renderRight(handleClickChecksButton, isExpanded)
            : rightSide}
        </div>
      </div>
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
}

interface SimpleHeadsUpCriteriaWrapperProps {
  criteria: CriteriaEntry;
  showAllChecksButton: boolean;
  handleClickChecksButton: React.MouseEventHandler;
}

export class SimpleHeadsUpCriteriaWrapper extends React.PureComponent<
  SimpleHeadsUpCriteriaWrapperProps
> {
  public render() {
    const { override, rating } = this.props.criteria;

    if (override && rating === "danger") {
      const { headline } = override;

      return (
        <SimpleHeadsup
          status={rating}
          icon={<DangerIcon />}
          headline={headline}
          showAllChecksButton={true}
        />
      );
    }

    return (
      <SimpleHeadsup
        status={rating}
        icon={this.renderStatus(rating)[0]}
        headline={this.renderStatus(rating)[1]}
        showAllChecksButton={true}
      />
    );
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
