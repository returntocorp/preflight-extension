import DomElementLoadedWatcher from "@r2c/extension/content/github/DomElementLoadedWatcher";
import {
  ErrorHeadsUp,
  LoadingHeadsUp,
  UnsupportedHeadsUp
} from "@r2c/extension/content/headsup/NonIdealHeadsup";
import {
  PreflightChecklist,
  PreflightChecklistFetch,
  PreflightChecklistItemType
} from "@r2c/extension/content/headsup/PreflightChecklist";
import UsedBy from "@r2c/extension/content/headsup/UsedBy";
import LastUpdatedBadge from "@r2c/extension/content/LastUpdatedBadge";
import RepoPackageSection from "@r2c/extension/content/PackageCopyBox";
import { R2CLogo } from "@r2c/extension/icons";
import { ExtractedRepoSlug } from "@r2c/extension/utils";
import * as React from "react";
import * as ReactDOM from "react-dom";
import "./index.css";

interface HeadsUpProps {
  repoSlug: ExtractedRepoSlug;
  onChecklistItemClick(
    itemType: PreflightChecklistItemType
  ): React.MouseEventHandler<HTMLElement>;
}

interface HeadsupState {
  closed: boolean;
}

class NormalHeadsUp extends React.PureComponent<HeadsUpProps, HeadsupState> {
  public render() {
    return (
      <PreflightChecklistFetch>
        {({ loading, error, data, response }) => (
          <>
            {loading && <LoadingHeadsUp />}
            {response != null &&
              response.repo.status === 404 && <UnsupportedHeadsUp />}
            {error &&
              (response == null || response.repo.status !== 404) && (
                <ErrorHeadsUp error={error} />
              )}
            {data && (
              <div className="r2c-repo-headsup checklist-headsup">
                <header>
                  <div className="checklist-left">
                    <span className="preflight-logo">preflight</span>
                  </div>
                  <div className="checklist-right">
                    <LastUpdatedBadge
                      commitHash={data.findings.commitHash}
                      lastUpdatedDate={new Date(data.repo.analyzedAt)}
                      repoSlug={this.props.repoSlug}
                    />
                    <R2CLogo />
                  </div>
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
              </div>
            )}
          </>
        )}
      </PreflightChecklistFetch>
    );
  }
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
