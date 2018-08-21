import { extractCurrentUserFromPage } from "@r2c/extension/api/fetch";
import Discussion from "@r2c/extension/content/Discussion";
import {
  fetchOrCreateExtensionUniqueId,
  isRepositoryPrivate
} from "@r2c/extension/utils";
import * as classnames from "classnames";
import * as React from "react";
import { CSSTransition } from "react-transition-group";
import "./ActionBar.css";
import "./index.css";
import "./Twists.css";
import VotingBar from "./VotingBar";

interface DiscussionIconProps {
  count: number | undefined;
}

const DiscussionIcon: React.SFC<DiscussionIconProps> = ({ count }) => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M22 3v13h-11.643l-4.357 3.105v-3.105h-4v-13h20zm2-2h-24v16.981h4v5.019l7-5.019h13v-16.981z" />
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
        className={classnames("r2c-action-button", {
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
        </ActionBar>

        <Twists isOpen={this.state.twistTab != null}>
          <Discussion
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
