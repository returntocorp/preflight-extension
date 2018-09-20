import { Button, Icon, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { l } from "@r2c/extension/analytics";
import DomElementLoadedWatcher from "@r2c/extension/content/github/DomElementLoadedWatcher";
import { ErrorHeadsUp, LoadingHeadsUp, UnsupportedHeadsUp } from "@r2c/extension/content/headsup/NonIdealHeadsup";
import { PreflightChecklist, PreflightChecklistFetch, PreflightChecklistItemType } from "@r2c/extension/content/headsup/PreflightChecklist";
import UsedBy from "@r2c/extension/content/headsup/UsedBy";
import RepoPackageSection from "@r2c/extension/content/PackageCopyBox";
import { R2CLogo } from "@r2c/extension/icons";
import * as React from "react";
import * as ReactDOM from "react-dom";
import "./index.css";

interface HeadsUpProps {
  onChecklistItemClick(
    itemType: PreflightChecklistItemType
  ): React.MouseEventHandler<HTMLElement>;
}

interface HeadsupState {
  closed: boolean;
}

class NormalHeadsUp extends React.PureComponent<HeadsUpProps, HeadsupState> {
  public state: HeadsupState = {
    closed: false
  };

  public render() {
    if (this.state.closed) {
      return null;
    }

    return (
      <PreflightChecklistFetch>
        {({ loading, error, data, response }) => (
          <>
            {loading && <LoadingHeadsUp />}
            {response != null &&
              response.repo.status === 404 && <UnsupportedHeadsUp />}
            {error &&
              (response == null ||
              response.repo.status !== 404) && <ErrorHeadsUp error={error} />}
            {data && (
              <div className="r2c-repo-headsup checklist-headsup">
                <header>
                  <h1>Checklist</h1>
                  <Button
                    icon={IconNames.SMALL_CROSS}
                    minimal={true}
                    onClick={l("preflight-closed", this.closeMessage)}
                  />
                </header>
                <div className="repo-headsup-body">
                  <div className="repo-headsup-checklist">
                    <PreflightChecklist
                      {...data}
                      onChecklistItemClick={this.props.onChecklistItemClick}
                    />
                  </div>
                  <div className="repo-headsup-actions">
                    <RepoPackageSection />
                    <UsedBy pkg={data.pkg} />
                  </div>
                </div>
                <footer>
                  <div className="preflight-legend">
                    <span className="legend-check legend-entry">
                      <Icon
                        icon={IconNames.SMALL_TICK}
                        intent={Intent.SUCCESS}
                      />{" "}
                      Good
                    </span>
                    <span className="legend-warn legend-entry">
                      <Icon
                        icon={IconNames.SYMBOL_TRIANGLE_UP}
                        intent={Intent.WARNING}
                      />{" "}
                      Careful
                    </span>
                    <span className="legend-missing legend-entry">
                      <Icon icon={IconNames.MINUS} /> N/A
                    </span>
                  </div>
                  <div className="preflight-footer-side">
                    <div className="preflight-logo">
                      preflight <R2CLogo />
                    </div>
                  </div>
                </footer>
              </div>
            )}
          </>
        )}
      </PreflightChecklistFetch>
    );
  }

  private closeMessage: React.MouseEventHandler<HTMLElement> = e => {
    this.setState({ closed: true });
  };
}

interface RepoHeadsUpState {
  error: React.ErrorInfo | undefined;
}

class RepoHeadsUp extends React.PureComponent<HeadsUpProps, RepoHeadsUpState> {
  public state: RepoHeadsUpState = {
    error: undefined
  };

  public componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ error: info });
  }

  public render() {
    const navigation = document.querySelector(".repository-lang-stats-graph");
    const existingElem = document.querySelector(".r2c-repo-headsup-container");

    if (navigation == null) {
      return null;
    }

    if (existingElem != null) {
      existingElem.remove();
    }

    const injected = document.createElement("div");
    injected.classList.add("r2c-repo-headsup-container");
    navigation.after(injected);

    return ReactDOM.createPortal(
      <div className="preflight-container">
        {this.state.error != null && <ErrorHeadsUp error={this.state.error} />}
        {this.state.error == null && <NormalHeadsUp {...this.props} />}
      </div>,
      injected
    );
  }
}

export default class RepoHeadsUpInjector extends React.PureComponent<
  HeadsUpProps
> {
  public render() {
    return (
      <DomElementLoadedWatcher querySelector=".repository-lang-stats-graph">
        {({ done }) => done && <RepoHeadsUp {...this.props} />}
      </DomElementLoadedWatcher>
    );
  }
}
