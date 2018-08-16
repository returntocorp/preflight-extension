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

const R2C_LOGO = (
  <svg width="89" height="114" viewBox="0 0 89 114">
    <path d="M81.7731 111.834L22.7645 71.0697H54.0238C68.8246 71.0697 81.3898 58.8058 81.3898 43.5981C81.3898 28.5684 70.1037 16.1266 54.0238 16.1266H34.323L29.0264 21.4437L34.323 26.7607H54.0238C63.9901 26.7607 70.7965 34.1739 70.7965 43.5981C70.7965 52.8504 63.0565 60.4355 54.0238 60.4355H2.823V71.1242L62.7517 111.834H81.7731Z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M34.323 16.1266H54.0238C70.1037 16.1266 81.3898 28.5684 81.3898 43.5981C81.3898 58.8058 68.8246 71.0697 54.0238 71.0697H22.7645L81.7731 111.834H62.7517L2.823 71.1242V60.4355H54.0238C63.0565 60.4355 70.7965 52.8504 70.7965 43.5981C70.7965 34.1739 63.9901 26.7607 54.0238 26.7607H34.323L29.0264 21.4437L34.323 16.1266ZM29.1784 73.0697L88.187 113.834H62.1366L0.822998 72.1834V58.4355H54.0238C61.9589 58.4355 68.7965 51.7388 68.7965 43.5981C68.7965 35.2251 62.833 28.7607 54.0238 28.7607H33.4923L26.2034 21.4437L33.4923 14.1266H54.0238C71.2683 14.1266 83.3898 27.5249 83.3898 43.5981C83.3898 59.9196 69.9199 73.0697 54.0238 73.0697H29.1784Z"
    />
    <path d="M2.823 21.6326L21.5494 2.83389L26.5431 7.84687L7.81671 26.6456L2.823 21.6326Z" />
    <path d="M7.81673 16.6196L26.5432 35.4183L21.5494 40.4313L2.823 21.6326L7.81673 16.6196Z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 21.6326L21.5494 0L29.3661 7.84687L15.6334 21.6326L29.3662 35.4183L21.5494 43.2652L0 21.6326ZM2.823 21.6326L21.5494 40.4313L26.5432 35.4183L12.8104 21.6326L26.5431 7.84687L21.5494 2.83389L2.823 21.6326Z"
    />
  </svg>
);

const R2C_VOTING_ICONS = {
  up: (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
    </svg>
  ),
  down: (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" />
    </svg>
  ),
  question: (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path d="M14.601 21.5c0 1.38-1.116 2.5-2.499 2.5-1.378 0-2.499-1.12-2.499-2.5s1.121-2.5 2.499-2.5c1.383 0 2.499 1.119 2.499 2.5zm-2.42-21.5c-4.029 0-7.06 2.693-7.06 8h3.955c0-2.304.906-4.189 3.024-4.189 1.247 0 2.57.828 2.684 2.411.123 1.666-.767 2.511-1.892 3.582-2.924 2.78-2.816 4.049-2.816 7.196h3.943c0-1.452-.157-2.508 1.838-4.659 1.331-1.436 2.986-3.222 3.021-5.943.047-3.963-2.751-6.398-6.697-6.398z" />
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

async function getOrCreateExtensionUniqueId() {
  return new Promise((resolve, reject) => {
    browser.storage.local.get(
      "SECARTA_EXTENSION_INSTALLATION_ID",
      (res: ExtensionStorage) => {
        if (res.SECARTA_EXTENSION_INSTALLATION_ID != null) {
          resolve(res.SECARTA_EXTENSION_INSTALLATION_ID);
        } else {
          const arr = new Uint8Array(20 / 2);
          window.crypto.getRandomValues(arr);
          const installationId = [].map.call(arr, byteToHex).join("");
          browser.storage.local.set({
            SECARTA_EXTENSION_INSTALLATION_ID: installationId
          });
          resolve(installationId);
        }
      }
    );
  });
}

async function extractCurrentUserFromPage(): Promise<string> {
  const { domain } = extractSlugFromCurrentUrl();
  const extensionUniqueId = await getOrCreateExtensionUniqueId();
  const anonUserId = `anonymous-${extensionUniqueId}`;

  if (domain.includes("github.com")) {
    const userLoginMetaTags = document.getElementsByName("user-login");

    if (userLoginMetaTags.length === 0) {
      return anonUserId;
    }

    const user = userLoginMetaTags[0].getAttribute("content");

    if (user != null && user !== "") {
      return user;
    } else {
      return anonUserId;
    }
  } else {
    return anonUserId;
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

function buildExtensionHeaders(user: string | undefined) {
  return user != null ? { "X-Secarta-GitHub-User": user } : undefined;
}

interface VoteCounts {
  [key: string]: number;
}

function isRepositoryPrivate() {
  return document.querySelector("h1.private") != null;
}

function getAnalyticsParams(): {
  source: string;
  medium: string;
  content: string;
} {
  return {
    source: document.location.toString(),
    medium: "extension",
    content: "voting-checkcross-newcolors"
  };
}

interface VoteResponse {
  votes: VoteCounts;
  currentVote: string | undefined;
}

interface VotingBarState {
  currentUser: string;
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
    currentUser: "",
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
    return (
      <div id="r2c-voting-container">
        <a
          className="r2c-button"
          title="R2C Homepage"
          href="https://returntocorp.com"
        >
          {R2C_LOGO}
        </a>
        {!isRepositoryPrivate() &&
          ["up", "down", "question"].map(this.renderVoteButton)}
      </div>
    );
  }

  private renderVoteButton = (voteType: string) => {
    const { org, repo } = extractSlugFromCurrentUrl();
    const user = this.state.currentUser;

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
          <a
            className={classnames("secarta-vote-button", `vote-${voteType}`, {
              voted:
                this.state.response != null &&
                this.state.response.currentVote === voteType
            })}
            title={`Vote ${voteType} on ${org}/${repo}`}
            role="button"
            onClick={this.submitVote(voteType, user)}
          >
            <div className="vote-icon">
              {R2C_VOTING_ICONS[voteType]}
              {transitionState === "entering" && (
                <div className="voted-text">Voted</div>
              )}
            </div>
            <div className="vote-count">
              {this.state.response != null
                ? this.state.response.votes[voteType]
                : "?"}
            </div>
          </a>
        )}
      </CSSTransition>
    );
  };

  private handleVoteAnimationEntered = () => {
    this.setState({ voteSuccess: false });
  };

  private fetchVoteData = async () => {
    const votesUrl = buildVotingUrl(getAnalyticsParams());
    const currentUser = await extractCurrentUserFromPage();
    const response = await fetch(votesUrl, {
      headers: buildExtensionHeaders(currentUser)
    });

    if (response.ok) {
      const responseJson = await response.json();
      this.setState({ response: responseJson });
    } else {
      this.setState({ fetchFailed: true, fetchError: response.statusText });
    }
  };

  private updateCurrentUser = async () => {
    const currentUser = await extractCurrentUserFromPage();
    this.setState({ currentUser });
  };

  private submitVote = (vote: string, user: string) => (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    const body = {
      vote,
      user
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

    const headers = buildExtensionHeaders(user);
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
  };
}
