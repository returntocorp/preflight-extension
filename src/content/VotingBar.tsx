import { Position, Tooltip } from "@blueprintjs/core";
import { getExtensionVersion, isRepositoryPrivate } from "@r2c/extension/utils";
import * as classnames from "classnames";
import * as React from "react";
import { CSSTransition } from "react-transition-group";
import "./VotingBar.css";

// tslint:disable:no-any
type WindowBrowserShim = any;
// tslint:enable:no-any

declare global {
  interface Window {
    browser: WindowBrowserShim;
    chrome: WindowBrowserShim;
  }

  var browser: WindowBrowserShim;
}

if (window.browser == null) {
  // TODO: replace with https://github.com/mozilla/webextension-polyfill and https://github.com/DefinitelyTyped/DefinitelyTyped/pull/21749
  /* chrome are jerks */ window.browser = window.chrome;
}

const R2C_VOTING_ICONS = {
  up: (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path d="M0 16.67l2.829 2.83 9.175-9.339 9.167 9.339 2.829-2.83-11.996-12.17z" />
    </svg>
  ),
  down: (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z" />
    </svg>
  )
};

function extractSlugFromCurrentUrl(): {
  domain: string;
  org: string;
  repo: string;
  pathname: string;
  rest: string;
} {
  const { hostname: domain, pathname } = document.location;
  const [org, repo, ...rest] = pathname.slice(1).split("/");

  return { domain, org, repo, pathname, rest: rest.join("/") };
}

function byteToHex(byte: number) {
  return `0${byte.toString(16)}`.slice(-2);
}

interface ExtensionStorage {
  SECARTA_EXTENSION_INSTALLATION_ID?: string;
}

async function fetchOrCreateExtensionUniqueId(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    browser.storage.local.get(
      "SECARTA_EXTENSION_INSTALLATION_ID",
      (res: ExtensionStorage) => {
        if (res.SECARTA_EXTENSION_INSTALLATION_ID != null) {
          resolve(res.SECARTA_EXTENSION_INSTALLATION_ID);
        } else {
          const randomBytes = new Uint8Array(20 / 2);
          window.crypto.getRandomValues(randomBytes);
          if (randomBytes.every(elem => elem === 0)) {
            // Edge crypto.getRandomValues returns all 0s
            // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11795162/
            // Fall back to less cryptographically random method (PRNG strength doesn't really matter)
            randomBytes.forEach(
              // tslint:disable-next-line:insecure-random
              (elem, index) => (randomBytes[index] = Math.random() * 255)
            );
          }

          const installationId: string = [].map
            .call(randomBytes, byteToHex)
            .join("");
          browser.storage.local.set({
            SECARTA_EXTENSION_INSTALLATION_ID: installationId
          });
          resolve(installationId);
        }
      }
    );
  });
}

async function extractCurrentUserFromPage(): Promise<string | undefined> {
  const { domain } = extractSlugFromCurrentUrl();

  if (domain.includes("github.com")) {
    const userLoginMetaTags = document.getElementsByName("user-login");

    if (userLoginMetaTags.length === 0) {
      return undefined;
    }

    const user = userLoginMetaTags[0].getAttribute("content");

    if (user != null && user !== "") {
      return user;
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
}

function buildVotingUrl({
  source,
  medium,
  content
}: {
  source: string;
  medium: string;
  content: string;
}) {
  const { domain, org, repo } = extractSlugFromCurrentUrl();
  const params = new URLSearchParams({ source, medium, content });

  return `https://api.secarta.io/v1/vote/${domain}/${org}/${repo}?${params}`;
}

function buildExtensionHeaders(
  user: string | undefined,
  installationId: string
) {
  return {
    "X-Secarta-GitHub-User": user || "anonymous",
    "X-R2C-Extension-Installation-Id": installationId
  };
}

interface VoteCounts {
  [key: string]: number;
}

function getAnalyticsParams(): {
  source: string;
  medium: string;
  content: string;
} {
  return {
    source: document.location.toString(),
    medium: `extension@${getExtensionVersion()}`,
    content: "voting-updown-vertical"
  };
}

type SampleVoters = { [K in keyof VoteCounts]: string[] };

interface VoteResponse {
  votes: VoteCounts;
  currentVote: string | null;
  sampleVoters: SampleVoters;
}

interface VotingBarState {
  currentUser: string | undefined;
  installationId: string;
  response: VoteResponse | undefined;
  voting: boolean;
  voteSuccess: boolean;
  voteFailed: boolean;
  voteError: string | undefined;
  fetchFailed: boolean;
  fetchError: string | undefined;
}

export default class VotingBar extends React.Component<{}, VotingBarState> {
  public state: VotingBarState = {
    currentUser: undefined,
    installationId: "not-generated",
    response: undefined,
    voting: false,
    voteSuccess: false,
    voteFailed: false,
    voteError: undefined,
    fetchFailed: false,
    fetchError: undefined
  };

  public componentDidMount() {
    this.fetchVoteData();
    this.updateCurrentUser();
  }

  public render() {
    return <>{["up", "down"].map(this.renderVoteButton)}</>;
  }

  private renderVoteButton = (voteType: string) => {
    const { org, repo } = extractSlugFromCurrentUrl();
    const { currentUser, installationId } = this.state;
    const sampleVoters =
      this.state.response != null
        ? (this.state.response.sampleVoters[voteType] || []).filter(
            voter => !voter.startsWith("anonymous")
          )
        : undefined;
    const anonymousVoteCount =
      this.state.response != null
        ? (this.state.response.sampleVoters[voteType] || []).filter(voter =>
            voter.startsWith("anonymous")
          ).length
        : undefined;
    const voteCount =
      this.state.response != null
        ? this.state.response.votes[voteType]
        : undefined;

    return (
      <CSSTransition
        key={voteType}
        in={
          this.state.response != null &&
          this.state.response.currentVote === voteType &&
          (this.state.voting || this.state.voteSuccess)
        }
        classNames="vote-success"
        timeout={2000}
        onEntered={this.handleVoteAnimationEntered}
      >
        {transitionState => (
          <div
            className={classnames("secarta-vote-button", `vote-${voteType}`, {
              voted:
                this.state.response != null &&
                this.state.response.currentVote === voteType
            })}
          >
            <a
              className={classnames("secarta-vote-button-link")}
              title={`Vote ${voteType} on ${org}/${repo}`}
              role="button"
              onClick={this.toggleVote(voteType, currentUser, installationId)}
            >
              <div className="vote-icon">
                {R2C_VOTING_ICONS[voteType]}
                {transitionState === "entering" && (
                  <div className="voted-text">Voted</div>
                )}
              </div>
            </a>
            <Tooltip
              className="vote-count-container"
              position={Position.LEFT}
              popoverClassName="vote-count-popover"
              content={
                this.state.response != null &&
                sampleVoters != null &&
                voteCount != null &&
                voteCount > 0 ? (
                  <div className="sample-votes-container">
                    <div className="sample-vote-header">
                      <span className="sample-vote-header-text">
                        Others who voted {voteType}
                      </span>
                    </div>
                    <ul className="sample-votes">
                      {sampleVoters.map(voter => (
                        <li key={voter} className="voter">
                          <img
                            src={`https://github.com/${voter}.png`}
                            alt="" // Empty for presentation
                            role="presentation"
                            className="voter-profile-picture"
                          />
                          <span className="voter-name">{voter}</span>
                        </li>
                      ))}
                    </ul>
                    {voteCount - sampleVoters.length > 0 &&
                      sampleVoters.length > 0 && (
                        <span className="more-voters">
                          + {voteCount - sampleVoters.length} more{" "}
                        </span>
                      )}
                    {voteCount - sampleVoters.length > 0 &&
                      sampleVoters.length === 0 && (
                        <span className="more-voters">
                          {voteCount - sampleVoters.length}
                          {voteCount - sampleVoters.length > 1
                            ? " voters "
                            : " voter "}
                        </span>
                      )}
                    {anonymousVoteCount != null &&
                      anonymousVoteCount > 0 && (
                        <span className="anonymous-voters">
                          ({anonymousVoteCount} anonymous)
                        </span>
                      )}
                  </div>
                ) : (
                  undefined
                )
              }
            >
              <div className="vote-count">
                {this.state.response != null
                  ? this.state.response.votes[voteType]
                  : "?"}
              </div>
            </Tooltip>
          </div>
        )}
      </CSSTransition>
    );
  };

  private handleVoteAnimationEntered = () => {
    this.setState({ voteSuccess: false });
  };

  private fetchVoteData = async () => {
    const isRepoPrivate = isRepositoryPrivate();
    if (!isRepoPrivate) {
      const votesUrl = buildVotingUrl(getAnalyticsParams());
      const installationId = await fetchOrCreateExtensionUniqueId();
      const user = await extractCurrentUserFromPage();
      const response = await fetch(votesUrl, {
        headers: buildExtensionHeaders(user, installationId)
      });

      if (response.ok) {
        const responseJson = await response.json();
        this.setState({ response: responseJson });
      } else {
        this.setState({ fetchFailed: true, fetchError: response.statusText });
      }
    }
  };

  private updateCurrentUser = async () => {
    const installationId = await fetchOrCreateExtensionUniqueId();
    const currentUser = await extractCurrentUserFromPage();
    this.setState({ currentUser, installationId });
  };

  private toggleVote = (
    vote: string,
    user: string | undefined,
    installationId: string
  ) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      this.state.response != null &&
      this.state.response.currentVote === vote
    ) {
      this.submitVote(null, user, installationId)(e);
    } else {
      this.submitVote(vote, user, installationId)(e);
    }
  };

  private submitVote = (
    vote: string | null,
    user: string | undefined,
    installationId: string
  ) => async (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isRepoPrivate = isRepositoryPrivate();
    if (!isRepoPrivate) {
      const body = {
        vote,
        user: user || `anonymous-${installationId}`
      };

      this.setState({
        voting: true,
        response:
          this.state.response != null
            ? { ...this.state.response, currentVote: vote }
            : undefined,
        voteSuccess: false,
        voteError: undefined,
        voteFailed: false
      });

      const headers = buildExtensionHeaders(user, installationId);
      fetch(buildVotingUrl(getAnalyticsParams()), {
        method: "POST",
        body: JSON.stringify(body),
        headers
      })
        .then(response => {
          if (!response.ok) {
            this.setState({
              voting: false,
              voteFailed: true,
              voteError: response.statusText
            });
          } else {
            this.setState({ voting: false, voteSuccess: true });
            response.json().then((responseJson: VoteResponse) => {
              this.setState({ response: responseJson });
            });
          }
        })
        // tslint:disable-next-line:no-any
        .catch((error: any) =>
          this.setState({ voteFailed: true, voteError: error })
        );
    }
  };
}
