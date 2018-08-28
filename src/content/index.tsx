import "./ActionBar.css";
import "./index.css";
import "./Twists.css";

import * as classnames from "classnames";
import * as React from "react";

import {
  fetchOrCreateExtensionUniqueId,
  isRepositoryPrivate
} from "@r2c/extension/utils";

import { extractCurrentUserFromPage } from "@r2c/extension/api/fetch";
import Discussion from "@r2c/extension/content/Discussion";
import { CSSTransition } from "react-transition-group";
import ShareSection from "./Share";
import VotingBar from "./VotingBar";

interface DiscussionIconProps {
  count: number | undefined;
}

interface ShareIconProps {
  enabled: boolean;
}

const DiscussionIcon: React.SFC<DiscussionIconProps> = ({ count }) => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M22 3v13h-11.643l-4.357 3.105v-3.105h-4v-13h20zm2-2h-24v16.981h4v5.019l7-5.019h13v-16.981z" />
  </svg>
);

const ShareIcon: React.SFC<ShareIconProps> = ({ enabled }) => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M5 7c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5zm11.122 12.065c-.073.301-.122.611-.122.935 0 2.209 1.791 4 4 4s4-1.791 4-4-1.791-4-4-4c-1.165 0-2.204.506-2.935 1.301l-5.488-2.927c-.23.636-.549 1.229-.943 1.764l5.488 2.927zm7.878-15.065c0-2.209-1.791-4-4-4s-4 1.791-4 4c0 .324.049.634.122.935l-5.488 2.927c.395.535.713 1.127.943 1.764l5.488-2.927c.731.795 1.77 1.301 2.935 1.301 2.209 0 4-1.791 4-4z" />
  </svg>
);

interface ActionButtonProps {
  onActionClick: React.MouseEventHandler<HTMLElement>;
  selected: boolean;
}

type DiscussionActionButtonProps = ActionButtonProps;

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
        onClick={this.handleActionClick}
      >
        <ShareIcon enabled={true} />
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

interface TwistsProps {
  isOpen: boolean;
}

const Twists: React.SFC<TwistsProps> = ({ isOpen, children }) => (
  <CSSTransition
    in={isOpen}
    classNames="twists-transition"
    timeout={300}
    mountOnEnter={true}
    unmountOnExit={true}
  >
    <div className="r2c-twists">{children}</div>
  </CSSTransition>
);

interface ContentHostState {
  twistTab: string | undefined;
  user: string | undefined;
  installationId: string;
}

export default class ContentHost extends React.Component<{}, ContentHostState> {
  public state: ContentHostState = {
    twistTab: undefined,
    user: undefined,
    installationId: "not-generated"
  };

  public componentDidMount() {
    this.updateCurrentUser();
  }

  public render() {
    return (
      <div className="r2c-host">
        <ActionBar>
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

        <Twists isOpen={this.state.twistTab === "discussion"}>
          <Discussion
            user={this.state.user}
            installationId={this.state.installationId}
          />
        </Twists>
        <Twists isOpen={this.state.twistTab === "share"}>
          <ShareSection
            user={this.state.user}
            installationId={this.state.installationId}
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
