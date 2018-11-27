import { li } from "@r2c/extension/analytics";
import DomElementLoadedWatcher from "@r2c/extension/content/github/DomElementLoadedWatcher";
import DOMInjector from "@r2c/extension/content/github/DomInjector";
import {
  ErrorHeadsUp,
  LoadingHeadsUp,
  MissingDataHeadsUp,
  UnsupportedHeadsUp
} from "@r2c/extension/content/headsup/NonIdealHeadsup";
import NormalHeadsUp from "@r2c/extension/content/headsup/NormalHeadsup";
import { OverrideHeadsupWrapper } from "@r2c/extension/content/headsup/OverrideHeadsup";
import { PreflightChecklistItemType } from "@r2c/extension/content/headsup/PreflightChecklist";
import PreflightFetch, {
  PreflightChecklistFetchData,
  PreflightChecklistFetchResponse
} from "@r2c/extension/content/headsup/PreflightFetch";
import * as ProjectState from "@r2c/extension/content/headsup/PreflightProjectState";
import { ExtractedRepoSlug, hasSupportedLanguages } from "@r2c/extension/utils";
import { map } from "lodash";
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

interface RepoHeadsUpProps extends HeadsUpProps {
  detectedLanguages: string[];
}

class RepoHeadsUp extends React.PureComponent<
  RepoHeadsUpProps,
  RepoHeadsUpState
> {
  public state: RepoHeadsUpState = {
    error: undefined
  };

  public componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ error: info });
    li("repo-headsup-error", { error, info });
  }

  public render() {
    if (this.state.error) {
      return (
        <ErrorHeadsUp
          projectState={ProjectState.ERROR_UNKNOWN}
          error={this.state.error}
        />
      );
    } else {
      const { repoSlug } = this.props;

      return (
        <PreflightFetch repoSlug={repoSlug}>
          {fetchResponse => {
            const { loading, error, data } = fetchResponse;
            const state = flowProjectState(
              fetchResponse,
              this.props.detectedLanguages
            );

            switch (state) {
              case ProjectState.LOADING_ALL:
                return <LoadingHeadsUp />;
              case ProjectState.EMPTY_UNSUPPORTED:
                return <UnsupportedHeadsUp />;
              case ProjectState.ERROR_MISSING_DATA:
                return <MissingDataHeadsUp />;
              case ProjectState.ERROR_API:
                return (
                  error != null && (
                    <ErrorHeadsUp projectState={state} error={error} />
                  )
                );
              case ProjectState.OVERRIDE:
                return (
                  data != null &&
                  data.pkg != null &&
                  data.pkg.override != null && (
                    <OverrideHeadsupWrapper override={data.pkg.override}>
                      <NormalHeadsUp
                        data={data}
                        loading={loading}
                        {...this.props}
                      />
                    </OverrideHeadsupWrapper>
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
}

export function flowProjectState(
  { data, loading, error, response }: PreflightChecklistFetchResponse,
  detectedLanguages: string[]
): ProjectState.PreflightProjectState {
  if (!hasSupportedLanguages(detectedLanguages)) {
    return ProjectState.EMPTY_UNSUPPORTED;
  } else if (loading != null && loading.some) {
    if (loading.every) {
      return ProjectState.LOADING_ALL;
    } else {
      return ProjectState.LOADING_SOME;
    }
  } else if (response != null && error != null && error.every) {
    if (
      (Object.keys(response) as (keyof PreflightChecklistFetchData)[]).every(
        k => response[k] != null && response[k].status === 404
      )
    ) {
      return ProjectState.ERROR_MISSING_DATA;
    } else {
      return ProjectState.ERROR_API;
    }
  } else if (data != null && data.some) {
    if (data.pkg != null && data.pkg.override != null) {
      return ProjectState.OVERRIDE;
    } else if (data.every) {
      return ProjectState.COMPLETE;
    } else {
      return ProjectState.PARTIAL;
    }
  } else {
    return ProjectState.ERROR_UNKNOWN;
  }
}

export default class RepoHeadsUpInjector extends React.PureComponent<
  HeadsUpProps
> {
  public render() {
    return (
      <DomElementLoadedWatcher querySelector=".repository-lang-stats-graph">
        {({ done, element }) =>
          done && (
            <DOMInjector
              destination=".repository-lang-stats-graph"
              childClassName="preflight-container"
              injectedClassName="r2c-repo-headsup-container"
              relation="after"
            >
              <div className="preflight-container">
                <RepoHeadsUp
                  {...this.props}
                  detectedLanguages={this.getDetectedLanguages(element)}
                />
              </div>
            </DOMInjector>
          )
        }
      </DomElementLoadedWatcher>
    );
  }

  private getDetectedLanguages = (element: Element | undefined): string[] => {
    if (element == null) {
      return [];
    } else {
      const languageSpans: NodeListOf<HTMLElement> = element.querySelectorAll(
        "span.language-color:not(.color-block)"
      );

      return map(languageSpans, languageSpan =>
        languageSpan.innerText.toLowerCase()
      );
    }
  };
}
