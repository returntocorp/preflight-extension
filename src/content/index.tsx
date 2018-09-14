import { Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { l } from "@r2c/extension/analytics";
import {
  buildExtensionHeaders,
  extractCurrentUserFromPage,
  getAnalyticsParams
} from "@r2c/extension/api/fetch";
import { FindingsResponse, findingsUrl } from "@r2c/extension/api/findings";
import {
  buildVotingUrl,
  DEPRECATED_submitVote,
  VoteResponse
} from "@r2c/extension/api/votes";
import ActionButton from "@r2c/extension/content/ActionButton";
import Discussion from "@r2c/extension/content/Discussion";
import BlobFindingsInjector from "@r2c/extension/content/github/BlobFindingsInjector";
import TreeFindingsInjector from "@r2c/extension/content/github/TreeFindingsInjector";
import RepoHeadsUpInjector from "@r2c/extension/content/headsup";
import PreflightTwist from "@r2c/extension/content/PreflightTwist";
import { ShareActionType, ShareSection } from "@r2c/extension/content/Share";
import { MainToaster } from "@r2c/extension/content/Toaster";
import Twist, { TwistId } from "@r2c/extension/content/Twist";
import Twists from "@r2c/extension/content/Twists";
import {
  ExtensionState,
  getExtensionState
} from "@r2c/extension/shared/ExtensionState";
import {
  extractSlugFromCurrentUrl,
  fetchOrCreateExtensionUniqueId,
  isRepositoryPrivate,
  userOrInstallationId
} from "@r2c/extension/utils";
import * as React from "react";
import Fetch, { FetchUpdateOptions } from "react-fetch-component";
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

// const RepoIcon: React.SFC = () => {
//   return (
//     <svg width="24" height="24" fillRule="evenodd" clipRule="evenodd">
//       <path d="M23.548 10.931l-10.479-10.478c-.302-.302-.698-.453-1.093-.453-.396 0-.791.151-1.093.453l-2.176 2.176 2.76 2.76c.642-.216 1.377-.071 1.889.44.513.515.658 1.256.435 1.9l2.66 2.66c.644-.222 1.387-.078 1.901.437.718.718.718 1.881 0 2.6-.719.719-1.883.719-2.602 0-.54-.541-.674-1.334-.4-2l-2.481-2.481v6.529c.175.087.34.202.487.348.717.717.717 1.881 0 2.601-.719.718-1.884.718-2.601 0-.719-.72-.719-1.884 0-2.601.177-.178.383-.312.602-.402v-6.589c-.219-.089-.425-.223-.602-.401-.544-.544-.676-1.343-.396-2.011l-2.721-2.721-7.185 7.185c-.302.302-.453.697-.453 1.093 0 .395.151.791.453 1.093l10.479 10.478c.302.302.697.452 1.092.452.396 0 .791-.15 1.093-.452l10.431-10.428c.302-.303.452-.699.452-1.094 0-.396-.15-.791-.452-1.093" />
//     </svg>
//   );
// };

const ReportIcon: React.SFC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M4 24h-2v-24h2v24zm6.161-23c-1.8 0-3.436 1.017-4.161 1.638v11.362c2.447-3.692 5.281-2.538 7.526-1.909 4.435 1.244 6.686-1.535 8.474-4.78-6.427 2.666-5.895-6.311-11.839-6.311z" />
  </svg>
);

const ShareIcon: React.SFC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M5 7c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5zm11.122 12.065c-.073.301-.122.611-.122.935 0 2.209 1.791 4 4 4s4-1.791 4-4-1.791-4-4-4c-1.165 0-2.204.506-2.935 1.301l-5.488-2.927c-.23.636-.549 1.229-.943 1.764l5.488 2.927zm7.878-15.065c0-2.209-1.791-4-4-4s-4 1.791-4 4c0 .324.049.634.122.935l-5.488 2.927c.395.535.713 1.127.943 1.764l5.488-2.927c.731.795 1.77 1.301 2.935 1.301 2.209 0 4-1.791 4-4z" />
  </svg>
);

interface ContentHostState {
  twistTab: string | undefined;
  user: string | undefined;
  installationId: string;
  extensionState: ExtensionState | undefined;
  currentUrl: string;
}

export default class ContentHost extends React.Component<{}, ContentHostState> {
  public state: ContentHostState = {
    twistTab: undefined,
    user: undefined,
    installationId: "not-generated",
    extensionState: undefined,
    currentUrl: window.location.href.replace(window.location.hash, "")
  };

  private navigationMutationObserver: MutationObserver | null = null;

  public async componentDidMount() {
    this.updateCurrentUser();
    this.watchNavigationChange();
    this.setState({ extensionState: await getExtensionState() });
  }

  public render() {
    const { twistTab, user, installationId, extensionState } = this.state;

    const repoSlug = extractSlugFromCurrentUrl();

    if (isRepositoryPrivate() || installationId === "not-generated") {
      return null;
    }

    return (
      <>
        <div id="r2c-inline-injector-portal" />
        <div className="r2c-host">
          <RepoHeadsUpInjector />
          {repoSlug != null && (
            <Fetch<FindingsResponse>
              url={findingsUrl(repoSlug.domain, repoSlug.org, repoSlug.repo)}
            >
              {({
                data: findingsData,
                loading: findingsLoading,
                error: findingsError
              }) =>
                extensionState != null &&
                extensionState.experiments.recon &&
                findingsData != null && (
                  <>
                    <BlobFindingsInjector
                      key={`BlobFindingsInjector ${this.state.currentUrl}`}
                      findings={findingsData.findings}
                    />
                    <TreeFindingsInjector
                      key={`TreeFindingsInjector ${this.state.currentUrl}`}
                      findings={findingsData.findings}
                      repoSlug={repoSlug}
                    />
                  </>
                )
              }
            </Fetch>
          )}

          {/* TODO cleanup headers */}
          <Fetch<VoteResponse>
            url={buildVotingUrl(getAnalyticsParams())}
            options={{ headers: buildExtensionHeaders(user, installationId) }}
          >
            {({ data: voteData, fetch: voteFetch }) => (
              <Twists
                isOpen={twistTab != null}
                selectedTwistId={twistTab}
                onTwistChange={this.handleTwistChange}
              >
                {extensionState != null &&
                  extensionState.experiments.preflightTwist && (
                    <Twist
                      id="preflight"
                      title="Preflight"
                      icon={<PreflightIcon />}
                      panel={<PreflightTwist repoSlug={repoSlug} />}
                    />
                  )}
                <Twist
                  id="discussion"
                  title="Comments"
                  icon={<DiscussionIcon />}
                  panel={
                    <Discussion user={user} installationId={installationId} />
                  }
                />
                <ActionButton
                  id="flag"
                  title="Flag an issue with this project"
                  icon={<ReportIcon />}
                  selected={
                    voteData != null ? voteData.currentVote === "down" : false
                  }
                  count={voteData != null ? voteData.votes.down : undefined}
                  intent={Intent.DANGER}
                  onClick={this.handleReportProject(voteFetch, voteData)}
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
                      onEmailClick={l(
                        "share-link-click-email",
                        this.onShareActionClick("email")
                      )}
                      onLinkClick={l(
                        "share-link-click-copy",
                        this.onShareActionClick("link")
                      )}
                      user={user}
                      installationId={installationId}
                    />
                  }
                />
              </Twists>
            )}
          </Fetch>
        </div>
      </>
    );
  }

  private watchNavigationChange() {
    this.navigationMutationObserver = new MutationObserver(
      this.handleNavigationChange
    );

    const main = document.querySelector(".application-main");

    if (main != null) {
      this.navigationMutationObserver.observe(main, {
        attributes: true,
        subtree: true
      });
    } else {
      console.warn("Unable to register mutation observer!");
    }
  }

  private handleNavigationChange: MutationCallback = mutations => {
    const locationWithoutHash = window.location.href.replace(
      window.location.hash,
      ""
    );
    if (locationWithoutHash !== this.state.currentUrl) {
      this.setState({ currentUrl: locationWithoutHash });
    }
  };

  private updateCurrentUser = async () => {
    const installationId = await fetchOrCreateExtensionUniqueId();
    const user = await extractCurrentUserFromPage();
    this.setState({ user, installationId });
  };

  private handleTwistChange = (
    twist: TwistId,
    e: React.MouseEvent<HTMLInputElement>
  ) => {
    if (this.state.twistTab !== twist) {
      this.setState({ twistTab: twist });
    } else {
      this.setState({ twistTab: undefined });
    }
  };

  private onShareActionClick = (
    buttonTitle: ShareActionType
  ): React.MouseEventHandler<HTMLElement> => e => {
    console.log("Logging share link action!");
  };

  private handleReportProject = (
    voteFetch: (
      url: string,
      options?: RequestInit,
      updateOptions?: Partial<FetchUpdateOptions>
    ) => void,
    voteData: VoteResponse | undefined
  ) => (id: TwistId, e: React.MouseEvent<HTMLElement>) => {
    if (voteData != null) {
      const newVote = voteData.currentVote == null ? "down" : null;

      l("flag-project-button-click", undefined, {
        currentVote: voteData.currentVote,
        newVote
      });

      this.submitVote(newVote, this.state.user, this.state.installationId)(
        e
      ).then(() => {
        if (newVote != null) {
          MainToaster.show({
            icon: IconNames.FLAG,
            intent: Intent.SUCCESS,
            message:
              "Flagged this project for review. Thanks!\n\nYou can also leave a comment with your opinion."
          });
        } else {
          MainToaster.show({
            icon: IconNames.FLASH,
            intent: Intent.SUCCESS,
            message: "Canceled your report for this project. Have a great day."
          });
        }

        // TODO cleanup
        voteFetch(buildVotingUrl(getAnalyticsParams()), {
          headers: buildExtensionHeaders(
            this.state.user,
            this.state.installationId
          )
        });
      });
    }
  };

  private submitVote = (
    vote: string | null,
    user: string | undefined,
    installationId: string
  ) => async (e: React.MouseEvent<HTMLElement>) => {
    const isRepoPrivate = isRepositoryPrivate();
    if (!isRepoPrivate) {
      const body = {
        vote,
        user: userOrInstallationId(user, installationId)
      };

      return DEPRECATED_submitVote(body);
    }

    return;
  };
}
