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
    <svg width="24" height="24" fillRule="evenodd" clipRule="evenodd">
      <path d="M24 20h-3v4l-5.333-4h-7.667v-4h2v2h6.333l2.667 2v-2h3v-8.001h-2v-2h4v12.001zm-6-6h-9.667l-5.333 4v-4h-3v-14.001h18v14.001z" />
    </svg>
  );
};

const PreflightIcon: React.SFC = () => (
  <svg width="24" height="24" fillRule="evenodd" clipRule="evenodd">
    <path d="M20 18v2h-20v-2h20zm-19.989-6.426l2.624-1.5 4.765 1.815s9.197-5.519 11.773-7.038c2.226-1.312 4.268-.853 4.647-.216.448.753.131 2.366-2.576 4.09-2.166 1.38-9.233 5.855-9.233 5.855-4.969 2.708-7.565.657-7.565.657l-4.435-3.663zm5.587-6.621l-2.598 1.5 6.252 3.173 5.388-3.227-9.042-1.446z" />
  </svg>
);

const ShareIcon: React.SFC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M5 7c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5zm11.122 12.065c-.073.301-.122.611-.122.935 0 2.209 1.791 4 4 4s4-1.791 4-4-1.791-4-4-4c-1.165 0-2.204.506-2.935 1.301l-5.488-2.927c-.23.636-.549 1.229-.943 1.764l5.488 2.927zm7.878-15.065c0-2.209-1.791-4-4-4s-4 1.791-4 4c0 .324.049.634.122.935l-5.488 2.927c.395.535.713 1.127.943 1.764l5.488-2.927c.731.795 1.77 1.301 2.935 1.301 2.209 0 4-1.791 4-4z" />
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
                    title="Preflight"
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
