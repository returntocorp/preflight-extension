import { Button, IconName } from "@blueprintjs/core";
import { l } from "@r2c/extension/analytics";
import { CriteriaEntry, CriteriaType } from "@r2c/extension/api/criteria";
import { OverrideType } from "@r2c/extension/api/package";
import LastUpdatedBadge from "@r2c/extension/content/LastUpdatedBadge";
import { CheckmarkIcon, DangerIcon, MissingIcon, PromoteIcon, WarningIcon } from "@r2c/extension/icons";
import { ExtractedRepoSlug, MarkdownString } from "@r2c/extension/utils";
import * as classnames from "classnames";
import * as React from "react";
import * as Markdown from "react-markdown";
import "./SimpleHeadsup.css";

interface StatusDescription {
  icon: React.ReactChild;
  headline: string | MarkdownString;
}

export type StatusType =
  | CriteriaType
  | "unsupported"
  | "loading"
  | "error"
  | "promote"
  | "incomplete";

interface SimpleHeadsupProps extends StatusDescription {
  status: StatusType;
  rightSide?: React.ReactChild | null;
}

export default class SimpleHeadsup extends React.PureComponent<
  SimpleHeadsupProps
> {
  public render() {
    const { status, icon, headline, rightSide } = this.props;

    return (
      <div
        className={classnames(
          "r2c-repo-headsup",
          "simple-headsup",
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
  lastUpdatedDate?: Date;
  repoSlug?: ExtractedRepoSlug;
}

export class SimpleHeadsUpCriteriaWrapper extends React.PureComponent<
  SimpleHeadsUpCriteriaWrapperProps
> {
  public render() {
    const { override, rating } = this.props.criteria;
    const {
      handleClickChecksButton,
      showAllChecksButton,
      lastUpdatedDate,
      repoSlug
    } = this.props;

    if (override) {
      const { headline, overrideType } = override;

      switch (overrideType) {
        case "blacklist":
          return (
            <SimpleHeadsup
              status={"danger"}
              icon={<DangerIcon />}
              headline={headline}
              rightSide={this.renderRight(
                handleClickChecksButton,
                showAllChecksButton,
                lastUpdatedDate,
                repoSlug
              )}
            />
          );

        default:
          return (
            <SimpleHeadsup
              status={"promote"}
              icon={<PromoteIcon />}
              headline={headline}
              rightSide={this.renderRight(
                handleClickChecksButton,
                showAllChecksButton,
                lastUpdatedDate,
                repoSlug
              )}
            />
          );
      }
    }

    return (
      <SimpleHeadsup
        status={rating}
        icon={this.renderStatus(rating).icon}
        headline={this.renderStatus(rating).headline}
        rightSide={this.renderRight(
          handleClickChecksButton,
          showAllChecksButton,
          lastUpdatedDate,
          repoSlug
        )}
      />
    );
  }

  private renderRight(
    handleClickChecksButton: React.MouseEventHandler | undefined,
    isExpanded: boolean | undefined,
    lastUpdatedDate?: Date,
    repoSlug?: ExtractedRepoSlug
  ) {
    return (
      <>
        {lastUpdatedDate && repoSlug && (
          <span className="simple-headsup-timestamp">
            <LastUpdatedBadge
              lastUpdatedDate={lastUpdatedDate}
              repoSlug={repoSlug}
            />{" "}
          </span>
        )}
        <span className="simple-headsup-show">
          <Button
            minimal={true}
            intent="primary"
            onClick={handleClickChecksButton}
            rightIcon={this.renderShowIcon(isExpanded)}
          >
            {this.renderShow(isExpanded)}
          </Button>
        </span>
      </>
    );
  }

  private renderShow(isExpanded: boolean | undefined) {
    return isExpanded ? "Hide all checks" : "Show all checks";
  }

  private renderShowIcon(isExpanded: boolean | undefined): IconName {
    return isExpanded ? "chevron-up" : "chevron-down";
  }

  private renderStatus(status: string): StatusDescription {
    switch (status) {
      case "safe":
        return {
          icon: <CheckmarkIcon />,
          headline: "Passes all Preflight checks"
        };
      case "warning":
        return {
          icon: <WarningIcon />,
          headline: "Fails some Preflight checks"
        };
      case "danger":
        return {
          icon: <DangerIcon />,
          headline: "Fails most Preflight checks"
        };
      default:
        return {
          icon: <MissingIcon />,
          headline: "Incomplete or unknown Preflight data"
        };
    }
  }
}

interface SimpleHeadsupDetailsWrapperProps {
  criteria: CriteriaEntry;
  handleClickChecksButton?: React.MouseEventHandler;
  showAllChecksButton: boolean;
  children: React.ReactChild;
  lastUpdatedDate?: Date;
  repoSlug?: ExtractedRepoSlug;
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
    const { criteria, children, lastUpdatedDate, repoSlug } = this.props;
    const { rating, override } = criteria;
    const { showMore } = this.state;

    let borderOverrideColor: OverrideType | StatusType = rating;
    if (override) {
      borderOverrideColor = override.overrideType;
    }

    return (
      <div
        className={classnames(
          { "detailed-headsup-open": showMore },
          `preflight-${borderOverrideColor}`
        )}
      >
        <SimpleHeadsUpCriteriaWrapper
          criteria={criteria}
          showAllChecksButton={showMore}
          handleClickChecksButton={l(
            `preflight-${showMore ? "hide" : "show"}-checks-button-click`,
            this.handleShowAllChecks,
            { status: rating }
          )}
          lastUpdatedDate={lastUpdatedDate}
          repoSlug={repoSlug}
        />
        <div className={classnames({ "simple-headsup-hidden": !showMore })}>
          {children}
        </div>
      </div>
    );
  }

  private handleShowAllChecks: React.MouseEventHandler = () =>
    this.setState({ showMore: !this.state.showMore });
}
