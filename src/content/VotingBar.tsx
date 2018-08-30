import { Position, Tooltip } from "@blueprintjs/core";
import { l } from "@r2c/extension/analytics";
import { getVotes, submitVote, VoteResponse } from "@r2c/extension/api/votes";
import { UserProps } from "@r2c/extension/shared/User";
import {
  buildGithubProfilePicUrl,
  extractSlugFromCurrentUrl,
  isRepositoryPrivate,
  userOrInstallationId
} from "@r2c/extension/utils";
import * as classnames from "classnames";
import * as React from "react";
import { CSSTransition } from "react-transition-group";
import "./VotingBar.css";

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

type VotingBarProps = UserProps;

interface VotingBarState {
  response: VoteResponse | undefined;
  voting: boolean;
  voteSuccess: boolean;
  voteFailed: boolean;
  voteError: string | undefined;
  fetchFailed: boolean;
  fetchError: string | undefined;
}

export default class VotingBar extends React.Component<
  VotingBarProps,
  VotingBarState
> {
  public state: VotingBarState = {
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
  }

  public render() {
    return <>{["up", "down"].map(this.renderVoteButton)}</>;
  }

  private renderVoteButton = (voteType: string) => {
    const { org, repo } = extractSlugFromCurrentUrl();
    const { user, installationId } = this.props;
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
              onClick={this.toggleVote(voteType, user, installationId)}
            >
              <div className="vote-icon">
                {R2C_VOTING_ICONS[voteType]}
                {transitionState === "entering" && (
                  <div className="voted-text">Voted</div>
                )}
              </div>
            </a>
            <Tooltip
              className="action-count-container"
              position={Position.LEFT}
              popoverClassName="vote-count-popover"
              onOpened={l(`vote-${voteType}-count-hover`)}
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
                            src={buildGithubProfilePicUrl(voter)}
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
              <div className={classnames("vote-count", "action-count")}>
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
      try {
        const response = await getVotes();
        this.setState({ response });
      } catch (e) {
        this.setState({ fetchFailed: true, fetchError: e });
      }
    }
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
        user: userOrInstallationId(user, installationId)
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

      submitVote(body)
        .then(response => {
          this.setState({ voting: false, voteSuccess: true, response });
        })
        // tslint:disable-next-line:no-any
        .catch((error: any) =>
          this.setState({
            voting: false,
            voteFailed: true,
            voteError: error
          })
        );
    }
  };
}
