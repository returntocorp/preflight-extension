import { l } from "@r2c/extension/analytics";
import { getComments } from "@r2c/extension/api/comments";
import { extractCurrentUserFromPage } from "@r2c/extension/api/fetch";
import Discussion from "@r2c/extension/content/Discussion";
import RepoTwist from "@r2c/extension/content/RepoTwist";
import Twist from "@r2c/extension/content/Twist";
import Twists from "@r2c/extension/content/Twists";
import {
  extractSlugFromCurrentUrl,
  fetchOrCreateExtensionUniqueId,
  isRepositoryPrivate
} from "@r2c/extension/utils";
import * as classnames from "classnames";
import * as React from "react";
import "./ActionBar.css";
import "./index.css";
import { ShareActionType, ShareSection } from "./Share";
import VotingBar from "./VotingBar";

const DiscussionIcon: React.SFC = () => {
  return (
    <svg width="24" height="24" fillRule="evenodd" clipRule="evenodd">
      <path d="M24 20h-3v4l-5.333-4h-7.667v-4h2v2h6.333l2.667 2v-2h3v-8.001h-2v-2h4v12.001zm-6-6h-9.667l-5.333 4v-4h-3v-14.001h18v14.001z" />
    </svg>
  );
};

const RepoIcon: React.SFC = () => {
  return (
    <svg width="24" height="24" fillRule="evenodd" clipRule="evenodd">
      <path d="M23.548 10.931l-10.479-10.478c-.302-.302-.698-.453-1.093-.453-.396 0-.791.151-1.093.453l-2.176 2.176 2.76 2.76c.642-.216 1.377-.071 1.889.44.513.515.658 1.256.435 1.9l2.66 2.66c.644-.222 1.387-.078 1.901.437.718.718.718 1.881 0 2.6-.719.719-1.883.719-2.602 0-.54-.541-.674-1.334-.4-2l-2.481-2.481v6.529c.175.087.34.202.487.348.717.717.717 1.881 0 2.601-.719.718-1.884.718-2.601 0-.719-.72-.719-1.884 0-2.601.177-.178.383-.312.602-.402v-6.589c-.219-.089-.425-.223-.602-.401-.544-.544-.676-1.343-.396-2.011l-2.721-2.721-7.185 7.185c-.302.302-.453.697-.453 1.093 0 .395.151.791.453 1.093l10.479 10.478c.302.302.697.452 1.092.452.396 0 .791-.15 1.093-.452l10.431-10.428c.302-.303.452-.699.452-1.094 0-.396-.15-.791-.452-1.093" />
    </svg>
  );
};

const ShareIcon: React.SFC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M5 7c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5zm11.122 12.065c-.073.301-.122.611-.122.935 0 2.209 1.791 4 4 4s4-1.791 4-4-1.791-4-4-4c-1.165 0-2.204.506-2.935 1.301l-5.488-2.927c-.23.636-.549 1.229-.943 1.764l5.488 2.927zm7.878-15.065c0-2.209-1.791-4-4-4s-4 1.791-4 4c0 .324.049.634.122.935l-5.488 2.927c.395.535.713 1.127.943 1.764l5.488-2.927c.731.795 1.77 1.301 2.935 1.301 2.209 0 4-1.791 4-4z" />
  </svg>
);

interface ActionButtonProps {
  onActionClick: React.MouseEventHandler<HTMLElement>;
  selected: boolean;
}

interface DiscussionActionButtonState {
  commentCount: number | undefined;
}

type DiscussionActionButtonProps = ActionButtonProps;
type RepoActionButtonProps = ActionButtonProps;

class DiscussionAction extends React.Component<
  DiscussionActionButtonProps,
  DiscussionActionButtonState
> {
  public state: DiscussionActionButtonState = {
    commentCount: undefined
  };

  public componentDidMount = () => {
    this.updateCommentCount();
  };

  public render() {
    return (
      <div className="action-button">
        <span className="action-count-container">
          <div className={classnames("action-count", "comment-count")}>
            {this.state.commentCount ? this.state.commentCount : 0}
          </div>
        </span>
        <a
          className={classnames(
            "r2c-action-button",
            "discussion-action-button",
            {
              selected: this.props.selected
            }
          )}
          title="See discussions"
          role="button"
          onClick={l("discussion-action-button-click", this.handleActionClick)}
        >
          <DiscussionIcon />
        </a>
      </div>
    );
  }

  private handleActionClick: React.MouseEventHandler<HTMLAnchorElement> = e => {
    this.props.onActionClick(e);
  };

  private updateCommentCount = () => {
    getComments().then(
      response => {
        this.setState({ commentCount: response.comments.length });
      },
      () => console.error("Unable to load comments.")
    );
  };
}

class RepoAction extends React.Component<RepoActionButtonProps> {
  public render() {
    return (
      <a
        className={classnames("r2c-action-button", "repo-action-button", {
          selected: this.props.selected
        })}
        title="Repo info"
        role="button"
        onClick={l("repo-action-button-click", this.handleActionClick)}
      >
        <RepoIcon />
      </a>
    );
  }

  private handleActionClick: React.MouseEventHandler<HTMLAnchorElement> = e => {
    this.props.onActionClick(e);
  };
}

type ShareButtonProps = ActionButtonProps;

class ShareAction extends React.Component<ShareButtonProps> {
  public render() {
    return (
      <a
        className={classnames("r2c-action-button", "share-action-button", {
          selected: this.props.selected
        })}
        title="Share"
        role="button"
        onClick={l("share-action-button-click", this.handleActionClick)}
      >
        <ShareIcon />
      </a>
    );
  }

  private handleActionClick: React.MouseEventHandler<HTMLAnchorElement> = e => {
    this.props.onActionClick(e);
  };
}

const ActionBar: React.SFC = ({ children }) => (
  <div className="r2c-action-bar">{children}</div>
);

interface ContentHostState {
  twistTab: string | undefined;
  user: string | undefined;
  repoSlug: { domain: string; org: string; repo: string } | undefined;
  installationId: string;
}

export default class ContentHost extends React.Component<{}, ContentHostState> {
  public state: ContentHostState = {
    twistTab: undefined,
    user: undefined,
    repoSlug: undefined,
    installationId: "not-generated"
  };

  public componentDidMount() {
    this.updateCurrentUser();
    this.updateCurrentRepo();
  }

  public render() {
    return (
      <div className="r2c-host">
        <ActionBar>
          {!isRepositoryPrivate() && (
            <RepoAction
              onActionClick={this.openTwist("repo")}
              selected={this.state.twistTab === "repo"}
            />
          )}
          {!isRepositoryPrivate() && (
            <DiscussionAction
              onActionClick={this.openTwist("discussion")}
              selected={this.state.twistTab === "discussion"}
            />
          )}
          {!isRepositoryPrivate() && (
            <VotingBar
              user={this.state.user}
              installationId={this.state.installationId}
            />
          )}
          {!isRepositoryPrivate() && (
            <ShareAction
              onActionClick={this.openTwist("share")}
              selected={this.state.twistTab === "share"}
            />
          )}
        </ActionBar>

        <Twists
          isOpen={this.state.twistTab != null}
          selectedTwistId={this.state.twistTab}
        >
          <Twist
            id="discussion"
            panel={
              <Discussion
                user={this.state.user}
                installationId={this.state.installationId}
              />
            }
          />
          <Twist
            id="repo"
            panel={<RepoTwist repoSlug={this.state.repoSlug} />}
          />
          <Twist
            id="share"
            panel={
              <ShareSection
                rtcLink="https://tinyurl.com/r2c-beta"
                shortDesc={
                  "Hope you enjoy using the extension. Share our extension with your friends using below!"
                }
                onEmailClick={l(
                  "share-link-click-email",
                  this.onShareActionClick("email")
                )}
                onLinkClick={l(
                  "share-link-click-copy",
                  this.onShareActionClick("link")
                )}
                user={this.state.user}
                installationId={this.state.installationId}
              />
            }
          />
        </Twists>
      </div>
    );
  }

  private updateCurrentUser = async () => {
    const installationId = await fetchOrCreateExtensionUniqueId();
    const user = await extractCurrentUserFromPage();
    this.setState({ user, installationId });
  };

  private updateCurrentRepo = () => {
    const { domain, org, repo } = extractSlugFromCurrentUrl();

    this.setState({ repoSlug: { domain, org, repo } });
  };

  private openTwist = (
    page: string
  ): React.MouseEventHandler<HTMLElement> => e => {
    if (this.state.twistTab !== page) {
      this.setState({ twistTab: page });
    } else {
      this.setState({ twistTab: undefined });
    }
  };

  private onShareActionClick = (
    buttonTitle: ShareActionType
  ): React.MouseEventHandler<HTMLElement> => e => {
    console.log("Logging share link aciton!");
  };
}
