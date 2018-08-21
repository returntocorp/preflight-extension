import { extractCurrentUserFromPage } from "@r2c/extension/api/fetch";
import Discussion from "@r2c/extension/content/Discussion";
import { fetchOrCreateExtensionUniqueId } from "@r2c/extension/utils";
import * as classnames from "classnames";
import * as React from "react";
import { CSSTransition } from "react-transition-group";
import "./ActionBar.css";
import "./Guide.css";
import "./index.css";
import VotingBar from "./VotingBar";

interface DiscussionIconProps {
  count: number | undefined;
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

interface GuideProps {
  isOpen: boolean;
}

const Guide: React.SFC<GuideProps> = ({ isOpen, children }) => (
  <CSSTransition
    in={isOpen}
    classNames="guide-transition"
    timeout={300}
    mountOnEnter={true}
    unmountOnExit={true}
  >
    <div className="r2c-guide">{children}</div>
  </CSSTransition>
);

interface ContentHostState {
  guideTab: string | undefined;
  user: string | undefined;
  installationId: string;
}

export default class ContentHost extends React.Component<{}, ContentHostState> {
  public state: ContentHostState = {
    guideTab: undefined,
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
          <a
            className="r2c-action-button"
            title="R2C Homepage"
            href="https://returntocorp.com"
          >
            {R2C_LOGO}
          </a>
          <DiscussionAction
            onActionClick={this.openGuide("discussion")}
            selected={this.state.guideTab === "discussion"}
          />
          <VotingBar />
        </ActionBar>

        <Guide isOpen={this.state.guideTab != null}>
          <Discussion
            user={this.state.user}
            installationId={this.state.installationId}
          />
        </Guide>
      </div>
    );
  }

  private updateCurrentUser = async () => {
    const installationId = await fetchOrCreateExtensionUniqueId();
    const user = await extractCurrentUserFromPage();
    this.setState({ user, installationId });
  };

  private openGuide = (
    page: string
  ): React.MouseEventHandler<HTMLElement> => e => {
    if (this.state.guideTab !== page) {
      this.setState({ guideTab: page });
    } else {
      this.setState({ guideTab: undefined });
    }
  };
}
