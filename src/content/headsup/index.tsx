import DomElementLoadedWatcher from "@r2c/extension/content/github/DomElementLoadedWatcher";
import DOMInjector from "@r2c/extension/content/github/DomInjector";
import {
  ErrorHeadsUp,
  LoadingHeadsUp,
  UnsupportedHeadsUp
} from "@r2c/extension/content/headsup/NonIdealHeadsup";
import NormalHeadsUp from "@r2c/extension/content/headsup/NormalHeadsup";
import {
  PreflightChecklistFetch,
  PreflightChecklistItemType
} from "@r2c/extension/content/headsup/PreflightChecklist";
import { ExtractedRepoSlug } from "@r2c/extension/utils";
import * as React from "react";
import "./index.css";

interface RepoHeadsUpState {
  error: React.ErrorInfo | undefined;
}

export interface HeadsUpProps {
  repoSlug: ExtractedRepoSlug;
  onChecklistItemClick(
    itemType: PreflightChecklistItemType
  ): React.MouseEventHandler<HTMLElement>;
}

export interface HeadsupState {
  closed: boolean;
}

class RepoHeadsUp extends React.PureComponent<HeadsUpProps, RepoHeadsUpState> {
  public state: RepoHeadsUpState = {
    error: undefined
  };

  public componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ error: info });
  }

  public render() {
    return (
      <DOMInjector
        destination=".repository-lang-stats-graph"
        childClassName="r2c-repo-headsup-container"
        injectedClassName="r2c-repo-headsup-container"
        relation="after"
      >
        <div className="preflight-container">
          {this.renderInjectedOrError()}
        </div>
      </DOMInjector>
    );
  }

  private renderInjectedOrError() {
    if (this.state.error) {
      return <ErrorHeadsUp error={this.state.error} />;
    } else {
      return (
        <PreflightChecklistFetch>
          {({ loading, error, data, response }) => {
            if (loading) {
              return <LoadingHeadsUp />;
            } else if (response != null && response.repo.status === 404) {
              return <UnsupportedHeadsUp />;
            } else if (
              error &&
              (response == null || response.repo.status !== 404) // Failed to make a network request or received a non-404 failure status code
            ) {
              return <ErrorHeadsUp error={error} />;
            } else if (data != null) {
              return <NormalHeadsUp data={data} {...this.props} />;
            } else {
              return (
                <ErrorHeadsUp
                  error={
                    new Error(
                      "Something went wrong! We're unable to determine the reason."
                    )
                  }
                />
              );
            }
          }}
        </PreflightChecklistFetch>
      );
    }
  }
}

export default class RepoHeadsUpInjector extends React.PureComponent<
  HeadsUpProps
> {
  public render() {
    return (
      <DomElementLoadedWatcher querySelector=".repository-lang-stats-graph">
        {({ done }) =>
          done && (
            <DOMInjector
              destination=".repository-lang-stats-graph"
              childClassName="r2c-repo-headsup-container"
              injectedClassName="r2c-repo-headsup-container"
              relation="after"
            >
              <RepoHeadsUp {...this.props} />
            </DOMInjector>
          )
        }
      </DomElementLoadedWatcher>
    );
  }
}
