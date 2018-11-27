import { l } from "@r2c/extension/analytics";
import { OverrideEntry, OverrideType } from "@r2c/extension/api/package";
import * as classnames from "classnames";
import * as React from "react";
import * as Markdown from "react-markdown";
import TimeAgo from "react-timeago";
import "./OverrideHeadsup.css";

const CrossIndicator: React.SFC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.151 17.943l-4.143-4.102-4.117 4.159-1.833-1.833 4.104-4.157-4.162-4.119 1.833-1.833 4.155 4.102 4.106-4.16 1.849 1.849-4.1 4.141 4.157 4.104-1.849 1.849z" />
  </svg>
);

const CircleIndicator: React.SFC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" />
  </svg>
);

const CheckIndicator: React.SFC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.25 17.292l-4.5-4.364 1.857-1.858 2.643 2.506 5.643-5.784 1.857 1.857-7.5 7.643z" />
  </svg>
);

const PromoteIndicator: React.SFC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M23.334 11.96c-.713-.726-.872-1.829-.393-2.727.342-.64.366-1.401.064-2.062-.301-.66-.893-1.142-1.601-1.302-.991-.225-1.722-1.067-1.803-2.081-.059-.723-.451-1.378-1.062-1.77-.609-.393-1.367-.478-2.05-.229-.956.347-2.026.032-2.642-.776-.44-.576-1.124-.915-1.85-.915-.725 0-1.409.339-1.849.915-.613.809-1.683 1.124-2.639.777-.682-.248-1.44-.163-2.05.229-.61.392-1.003 1.047-1.061 1.77-.082 1.014-.812 1.857-1.803 2.081-.708.16-1.3.642-1.601 1.302s-.277 1.422.065 2.061c.479.897.32 2.001-.392 2.727-.509.517-.747 1.242-.644 1.96s.536 1.347 1.17 1.7c.888.495 1.352 1.51 1.144 2.505-.147.71.044 1.448.519 1.996.476.549 1.18.844 1.902.798 1.016-.063 1.953.54 2.317 1.489.259.678.82 1.195 1.517 1.399.695.204 1.447.072 2.031-.357.819-.603 1.936-.603 2.754 0 .584.43 1.336.562 2.031.357.697-.204 1.258-.722 1.518-1.399.363-.949 1.301-1.553 2.316-1.489.724.046 1.427-.249 1.902-.798.475-.548.667-1.286.519-1.996-.207-.995.256-2.01 1.145-2.505.633-.354 1.065-.982 1.169-1.7s-.135-1.443-.643-1.96zm-12.584 5.43l-4.5-4.364 1.857-1.857 2.643 2.506 5.643-5.784 1.857 1.857-7.5 7.642z" />
  </svg>
);

interface OverrideHeadsupProps {
  override: OverrideEntry;
  isShowing?: boolean;
  onShowAnywaysClick: React.MouseEventHandler;
  onReportClick: React.MouseEventHandler;
}

export default class OverrideHeadsup extends React.PureComponent<
  OverrideHeadsupProps
> {
  public render() {
    const { headline, reportedAt, overrideType } = this.props.override;
    const { onShowAnywaysClick, onReportClick, isShowing } = this.props;

    return (
      <div
        className={classnames(
          "r2c-repo-headsup",
          "override-headsup",
          `override-${overrideType}`
        )}
      >
        <aside className="override-headsup-indicator">
          {this.renderIndicator(overrideType)}
        </aside>
        <section className="override-headsup-content">
          <header>
            <Markdown source={headline} className="override-headsup-headline" />
          </header>
          <section className="override-headsup-details">
            <span className="override-headsup-show">
              <a onClick={onShowAnywaysClick} role="button">
                {this.renderShow(overrideType, isShowing)}
              </a>
            </span>
            <span className="override-headsup-timestamp">
              Updated <TimeAgo date={reportedAt} /> &middot;{" "}
            </span>
            <span className="override-headsup-report">
              Is this a mistake?{" "}
              <a onClick={onReportClick} role="button">
                Let us know.
              </a>
            </span>
          </section>
        </section>
      </div>
    );
  }

  private renderShow(
    overrideType: OverrideType,
    isShowing: boolean | undefined
  ) {
    switch (overrideType) {
      case "blacklist":
        return isShowing
          ? "Hide Preflight info"
          : "Show Preflight info anyways (unsafe)";
      default:
        return isShowing ? "Hide Preflight info" : "Show Preflight info";
    }
  }

  private renderIndicator(overrideType: OverrideType) {
    switch (overrideType) {
      case "blacklist":
        return <CrossIndicator />;
      case "whitelist":
        return <CheckIndicator />;
      case "promote":
        return <PromoteIndicator />;
      default:
        return <CircleIndicator />;
    }
  }
}

interface OverrideHeadsupWrapperProps {
  override: OverrideEntry;
  children: React.ReactChild;
}

interface OverrideHeadsupWrapperState {
  showMore: boolean;
}

export class OverrideHeadsupWrapper extends React.PureComponent<
  OverrideHeadsupWrapperProps,
  OverrideHeadsupWrapperState
> {
  public state: OverrideHeadsupWrapperState = {
    showMore: false
  };

  public render() {
    const { override, children } = this.props;
    const { showMore } = this.state;

    return (
      <>
        <OverrideHeadsup
          override={override}
          onReportClick={
            l(
              "report-override-click",
              this.handleReportClick
            ) as React.MouseEventHandler
          }
          onShowAnywaysClick={this.handleShowAnyways}
          isShowing={showMore}
        />
        {showMore && children}
      </>
    );
  }

  private handleReportClick: React.MouseEventHandler = () => null;

  private handleShowAnyways: React.MouseEventHandler = () =>
    this.setState({ showMore: !this.state.showMore });
}
