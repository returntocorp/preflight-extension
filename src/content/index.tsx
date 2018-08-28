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
import VotingBar from "./VotingBar";

interface DiscussionIconProps {
  count: number | undefined;
}

const DiscussionIcon: React.SFC<DiscussionIconProps> = ({ count }) => {
  if (count != null && count > 1) {
    return (
      <svg width="24" height="24" fillRule="evenodd" clipRule="evenodd">
        <path d="M24 20h-3v4l-5.333-4h-7.667v-4h2v2h6.333l2.667 2v-2h3v-8.001h-2v-2h4v12.001zm-6-6h-9.667l-5.333 4v-4h-3v-14.001h18v14.001z" />
      </svg>
    );
  } else {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path d="M22 3v13h-11.643l-4.357 3.105v-3.105h-4v-13h20zm2-2h-24v16.981h4v5.019l7-5.019h13v-16.981z" />
      </svg>
    );
  }
};

const RepoIcon: React.SFC = () => {
  return (
    <svg width="24" height="24" fillRule="evenodd" clipRule="evenodd">
      <path d="M23.548 10.931l-10.479-10.478c-.302-.302-.698-.453-1.093-.453-.396 0-.791.151-1.093.453l-2.176 2.176 2.76 2.76c.642-.216 1.377-.071 1.889.44.513.515.658 1.256.435 1.9l2.66 2.66c.644-.222 1.387-.078 1.901.437.718.718.718 1.881 0 2.6-.719.719-1.883.719-2.602 0-.54-.541-.674-1.334-.4-2l-2.481-2.481v6.529c.175.087.34.202.487.348.717.717.717 1.881 0 2.601-.719.718-1.884.718-2.601 0-.719-.72-.719-1.884 0-2.601.177-.178.383-.312.602-.402v-6.589c-.219-.089-.425-.223-.602-.401-.544-.544-.676-1.343-.396-2.011l-2.721-2.721-7.185 7.185c-.302.302-.453.697-.453 1.093 0 .395.151.791.453 1.093l10.479 10.478c.302.302.697.452 1.092.452.396 0 .791-.15 1.093-.452l10.431-10.428c.302-.303.452-.699.452-1.094 0-.396-.15-.791-.452-1.093" />
    </svg>
  );
};

interface ActionButtonProps {
  onActionClick: React.MouseEventHandler<HTMLElement>;
  selected: boolean;
}

type DiscussionActionButtonProps = ActionButtonProps;
type RepoActionButtonProps = ActionButtonProps;

class DiscussionAction extends React.Component<DiscussionActionButtonProps> {
  public render() {
    return (
      <a
        className={classnames("r2c-action-button", "discussion-action-button", {
          selected: this.props.selected
        })}
        title="See discussions"
        role="button"
        onClick={this.handleActionClick}
      >
        <DiscussionIcon count={undefined} />
      </a>
    );
  }

  private handleActionClick: React.MouseEventHandler<HTMLAnchorElement> = e => {
    this.props.onActionClick(e);
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
        onClick={this.handleActionClick}
      >
        <RepoIcon />
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
}
