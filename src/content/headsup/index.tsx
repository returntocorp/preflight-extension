import DomElementLoadedWatcher from "@r2c/extension/content/github/DomElementLoadedWatcher";
import DOMInjector from "@r2c/extension/content/github/DomInjector";
import {
  ErrorHeadsUp,
  LoadingHeadsUp,
  UnsupportedHeadsUp
} from "@r2c/extension/content/headsup/NonIdealHeadsup";
import NormalHeadsUp from "@r2c/extension/content/headsup/NormalHeadsup";
import { PreflightChecklistItemType } from "@r2c/extension/content/headsup/PreflightChecklist";
import PreflightFetch, {
  PreflightChecklistFetchData,
  PreflightChecklistFetchResponse
} from "@r2c/extension/content/headsup/PreflightFetch";
import * as ProjectState from "@r2c/extension/content/headsup/PreflightProjectState";
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
        childClassName="preflight-container"
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
      return (
        <ErrorHeadsUp
          projectState={ProjectState.ERROR_UNKNOWN}
          error={this.state.error}
        />
      );
    } else {
      return (
        <PreflightFetch>
          {fetchResponse => {
            const { loading, error, data } = fetchResponse;
            const state = this.flowProjectState(fetchResponse);

            switch (state) {
              case ProjectState.LOADING_ALL:
                return <LoadingHeadsUp />;
              case ProjectState.EMPTY_UNSUPPORTED:
                return <UnsupportedHeadsUp />;
              case ProjectState.ERROR_API:
              case ProjectState.ERROR_MISSING_DATA:
                return (
                  error != null && (
                    <ErrorHeadsUp projectState={state} error={error} />
                  )
                );
              case ProjectState.LOADING_SOME:
              case ProjectState.PARTIAL:
              case ProjectState.COMPLETE:
                return (
                  data != null && (
                    <NormalHeadsUp
                      data={data}
                      loading={loading}
                      {...this.props}
                    />
                  )
                );
              case ProjectState.ERROR_UNKNOWN:
              default:
                return (
                  <ErrorHeadsUp
                    projectState={state}
                    error={
                      new Error(
                        "Something went wrong! We're unable to determine the reason."
                      )
                    }
                  />
                );
            }
          }}
        </PreflightFetch>
      );
    }
  }

  private flowProjectState({
    data,
    loading,
    error,
    response
  }: PreflightChecklistFetchResponse): ProjectState.PreflightProjectState {
    console.log(data, loading, error, response);
    if (loading != null && loading.some) {
      if (loading.every) {
        console.log("All loading");

        return ProjectState.LOADING_ALL;
      } else {
        console.log("Some loading");

        return ProjectState.LOADING_SOME;
      }
    } else if (response != null && error != null && error.every) {
      if (
        (Object.keys(response) as (keyof PreflightChecklistFetchData)[]).every(
          k => response[k] != null && response[k].status === 404
        )
      ) {
        console.log("Everything is 404");

        return ProjectState.ERROR_MISSING_DATA;
      } else {
        console.log("Everything is error, but also 404");

        return ProjectState.ERROR_API;
      }
    } else if (data != null && data.some) {
      if (data.every) {
        console.log("All complete");

        return ProjectState.COMPLETE;
      } else {
        console.log("Partial complete");

        return ProjectState.PARTIAL;
      }
    } else {
      console.log("Unknown error");

      return ProjectState.ERROR_UNKNOWN;
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
