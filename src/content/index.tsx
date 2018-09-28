import { l } from "@r2c/extension/analytics";
import { ApiFetch, getAnalyticsParams } from "@r2c/extension/api/fetch";
import {
  FindingsResponse,
  findingsUrlFromSlug
} from "@r2c/extension/api/findings";
import { buildVotingUrl, VoteResponse } from "@r2c/extension/api/votes";
import Discussion from "@r2c/extension/content/Discussion";
import BlobFindingsInjector from "@r2c/extension/content/github/BlobFindingsInjector";
import { extractCurrentUserFromPage } from "@r2c/extension/content/github/dom";
import TreeFindingsInjector from "@r2c/extension/content/github/TreeFindingsInjector";
import RepoHeadsUpInjector from "@r2c/extension/content/headsup";
import PreflightTwist from "@r2c/extension/content/PreflightTwist";
import { ShareSection } from "@r2c/extension/content/Share";
import Twist, { TwistId } from "@r2c/extension/content/Twist";
import Twists from "@r2c/extension/content/Twists";
import {
  ExtensionState,
  getExtensionState
} from "@r2c/extension/shared/ExtensionState";
import {
  extractSlugFromCurrentUrl,
  fetchOrCreateExtensionUniqueId,
  getCurrentUrlWithoutHash,
  isGitHubSlug,
  isRepositoryPrivate
} from "@r2c/extension/utils";
import * as React from "react";
import { PreflightChecklistItemType } from "./headsup/PreflightChecklist";
import "./index.css";

const DiscussionIcon: React.SFC = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path d="M2.001 9.352c0 1.873.849 2.943 1.683 3.943.031 1 .085 1.668-.333 3.183 1.748-.558 2.038-.778 3.008-1.374 1 .244 1.474.381 2.611.491-.094.708-.081 1.275.055 2.023-.752-.06-1.528-.178-2.33-.374-1.397.857-4.481 1.725-6.649 2.115.811-1.595 1.708-3.785 1.661-5.312-1.09-1.305-1.705-2.984-1.705-4.695-.001-4.826 4.718-8.352 9.999-8.352 5.237 0 9.977 3.484 9.998 8.318-.644-.175-1.322-.277-2.021-.314-.229-3.34-3.713-6.004-7.977-6.004-4.411 0-8 2.85-8 6.352zm20.883 10.169c-.029 1.001.558 2.435 1.088 3.479-1.419-.258-3.438-.824-4.352-1.385-.772.188-1.514.274-2.213.274-3.865 0-6.498-2.643-6.498-5.442 0-3.174 3.11-5.467 6.546-5.467 3.457 0 6.546 2.309 6.546 5.467 0 1.12-.403 2.221-1.117 3.074zm-7.563-3.021c0-.453-.368-.82-.82-.82s-.82.367-.82.82.368.82.82.82.82-.367.82-.82zm3 0c0-.453-.368-.82-.82-.82s-.82.367-.82.82.368.82.82.82.82-.367.82-.82zm3 0c0-.453-.368-.82-.82-.82s-.82.367-.82.82.368.82.82.82.82-.367.82-.82z" />
    </svg>
  );
};

const PreflightIcon: React.SFC = () => (
  <svg width="24" height="24" fillRule="evenodd" clipRule="evenodd">
    <path d="M12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12-12-5.377-12-12 5.377-12 12-12zm0 2c5.519 0 10 4.481 10 10s-4.481 10-10 10-10-4.481-10-10 4.481-10 10-10zm-4.809 11.077l3.627-1.796-3.717-3.17 1.149-.569 6.017 2.031 2.874-1.423c.757-.38 2.009-.278 2.294.296.045.092.065.195.065.306-.002.586-.59 1.381-1.221 1.698l-2.874 1.423-2.031 6.016-1.15.569-.268-4.878-3.626 1.796-.749 1.802-.804.398-.281-2.724-1.996-1.874.804-.399 1.887.498z" />
  </svg>
);

const ShareIcon: React.SFC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.507 13.941c-1.512 1.195-3.174 1.931-5.506 1.931-2.334 0-3.996-.736-5.508-1.931l-.493.493c1.127 1.72 3.2 3.566 6.001 3.566 2.8 0 4.872-1.846 5.999-3.566l-.493-.493zm-9.007-5.941c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5zm7 0c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5z" />
  </svg>
);

interface ContentHostState {
  twistTab: TwistId | undefined;
  user: string | undefined;
  installationId: string | undefined;
  extensionState: ExtensionState | undefined;
  currentUrl: string | undefined;
  navigationNonce: number;
  checklistItem: PreflightChecklistItemType | undefined;
}

const DEFAULT_STATE: ContentHostState = {
  twistTab: undefined,
  user: undefined,
  installationId: undefined,
  extensionState: undefined,
  currentUrl: undefined,
  navigationNonce: 0,
  checklistItem: undefined
};

export const ExtensionContext = React.createContext<ContentHostState>(
  DEFAULT_STATE
);

export default class ContentHost extends React.Component<{}, ContentHostState> {
  public state: ContentHostState = DEFAULT_STATE;

  private repoSlug = extractSlugFromCurrentUrl();

  private navigationMutationObserver: MutationObserver | null = null;

  public async componentDidMount() {
    const { user, installationId } = await this.getCurrentUser();
    const extensionState = await getExtensionState();
    const currentUrl = getCurrentUrlWithoutHash();
    this.watchNavigationChange();
    this.setState({
      extensionState,
      currentUrl,
      user,
      installationId
    });
  }

  public render() {
    const { twistTab, user, installationId } = this.state;

    if (isRepositoryPrivate()) {
      return null;
    }

    if (!isGitHubSlug(this.repoSlug)) {
      return null;
    }

    if (installationId == null) {
      return null;
    }

    return (
      <div className="r2c-content-host">
        <ExtensionContext.Provider value={this.state}>
          <div id="r2c-inline-injector-portal" />
          <div className="r2c-host">
            <RepoHeadsUpInjector
              key={`RepoHeadsUpInjector ${this.state.currentUrl} ${
                this.state.navigationNonce
              }`}
              onChecklistItemClick={this.handleChecklistItemClick}
            />
            {this.repoSlug != null && (
              <ApiFetch<FindingsResponse>
                url={findingsUrlFromSlug(this.repoSlug)}
              >
                {({
                  data: findingsData,
                  loading: findingsLoading,
                  error: findingsError
                }) =>
                  findingsData != null &&
                  findingsData.findings != null && (
                    <>
                      <BlobFindingsInjector
                        key={`BlobFindingsInjector ${this.state.currentUrl} ${
                          this.state.navigationNonce
                        }`}
                        findingCommitHash={findingsData.commitHash}
                        findings={findingsData.findings}
                        repoSlug={this.repoSlug}
                      />
                      <TreeFindingsInjector
                        key={`TreeFindingsInjector ${this.state.currentUrl} ${
                          this.state.navigationNonce
                        }`}
                        findings={findingsData.findings}
                        commitHash={findingsData.commitHash}
                        repoSlug={this.repoSlug}
                      />
                    </>
                  )
                }
              </ApiFetch>
            )}

            <ApiFetch<VoteResponse> url={buildVotingUrl(getAnalyticsParams())}>
              {({ data: voteData, fetch: voteFetch }) => (
                <Twists
                  isOpen={twistTab != null}
                  selectedTwistId={twistTab}
                  onTwistChange={this.handleTwistChange}
                >
                  <Twist
                    id="preflight"
                    title="Details"
                    icon={<PreflightIcon />}
                    panel={
                      <PreflightTwist
                        repoSlug={this.repoSlug}
                        deepLink={this.state.checklistItem}
                      />
                    }
                  />
                  <Twist
                    id="discussion"
                    title="Comments"
                    icon={<DiscussionIcon />}
                    panel={
                      <Discussion user={user} installationId={installationId} />
                    }
                  />
                  <Twist
                    id="share"
                    title="Share the extension"
                    icon={<ShareIcon />}
                    panel={
                      <ShareSection
                        rtcLink="https://tinyurl.com/r2c-beta"
                        shortDesc={
                          "Hope you enjoy using the extension. Share our extension with your friends using the options below!"
                        }
                        onEmailClick={l("share-link-click-email")}
                        onLinkClick={l("share-link-click-copy")}
                        user={user}
                        installationId={installationId}
                      />
                    }
                  />
                </Twists>
              )}
            </ApiFetch>
          </div>
        </ExtensionContext.Provider>
      </div>
    );
  }

  private handleChecklistItemClick = (itemType: PreflightChecklistItemType) => (
    e: React.MouseEvent<HTMLElement>
  ) => {
    this.setState({ twistTab: "preflight", checklistItem: itemType });
  };

  private watchNavigationChange() {
    this.navigationMutationObserver = new MutationObserver(
      this.handleLoadingMutation
    );

    const main = document.querySelector("#js-pjax-loader-bar");

    if (main != null) {
      this.navigationMutationObserver.observe(main, {
        attributes: true,
        attributeFilter: ["class"],
        attributeOldValue: true
      });
    } else {
      console.warn("Unable to register mutation observer!");
    }
  }

  private handleLoadingMutation: MutationCallback = mutations => {
    mutations.forEach(mutation => {
      switch (mutation.type) {
        case "attributes":
          if (mutation.target.nodeType === Node.ELEMENT_NODE) {
            const mutationElem = mutation.target as Element;
            if (
              !mutationElem.classList.contains("is-loading") &&
              mutation.oldValue != null &&
              mutation.oldValue.indexOf("is-loading") >= 0
            ) {
              this.handleNavigationChange();
            }
          }
          break;
        default:
      }
    });
  };

  private handleNavigationChange = () => {
    const locationWithoutHash = getCurrentUrlWithoutHash();

    this.setState({ navigationNonce: this.state.navigationNonce + 1 });

    if (locationWithoutHash !== this.state.currentUrl) {
      this.setState({ currentUrl: locationWithoutHash });
    }
  };

  private getCurrentUser = async (): Promise<{
    user: string | undefined;
    installationId: string;
  }> => {
    const installationId = await fetchOrCreateExtensionUniqueId();
    const user = await extractCurrentUserFromPage();

    return { user, installationId };
  };

  private handleTwistChange = (
    twist: TwistId,
    e: React.MouseEvent<HTMLInputElement>
  ) => {
    if (this.state.twistTab !== twist) {
      this.setState({ twistTab: twist, checklistItem: undefined });
    } else {
      this.setState({ twistTab: undefined, checklistItem: undefined });
    }
  };
}
