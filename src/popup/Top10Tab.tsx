import { NonIdealState, Spinner } from "@blueprintjs/core";
import {
  ControversialVoteStatistics,
  getVoteOverview,
  VoteCountStatistics,
  VoteOverviewResponse
} from "@r2c/extension/api/votes";
import { getSlugFromUrl } from "@r2c/extension/utils";
import * as React from "react";
import "./Top10Tab.css";

const ControversialRepoEntry: React.SFC<ControversialVoteStatistics> = ({
  gitUrl,
  up,
  down
}) => (
  <article className="top10-controversial-repo">
    <div className="controversial-giturl">
      <a href={gitUrl} target="_blank" rel="noreferrer noopener">
        {getSlugFromUrl(gitUrl)}
      </a>
    </div>
    <div className="controversial-votes">
      <div className="controversial-vote-up">+{up}</div>
      <div className="controversial-vote-down">−{down}</div>
    </div>
  </article>
);

const VotedRepoEntry: React.SFC<VoteCountStatistics> = ({
  gitUrl,
  numVotes
}) => (
  <article className="top10-popular-repo">
    <div className="popular-giturl">
      <a href={gitUrl} target="_blank" rel="noreferrer noopener">
        {getSlugFromUrl(gitUrl)}
      </a>
    </div>
    <div className="popular-vote-count">{numVotes} votes</div>
  </article>
);

const Top10Fetching: React.SFC = () => (
  <div className="top10-fetching">
    <NonIdealState icon={<Spinner />} title="Arranging awards banquet..." />
  </div>
);

const Top10Failed: React.SFC = () => (
  <div className="top10-failed">
    <NonIdealState title="Couldn't load top 10" />
  </div>
);

interface Top10State {
  response: VoteOverviewResponse | undefined;
  fetching: boolean;
  fetched: boolean;
  fetchFailed: boolean;
  fetchError: string | undefined;
}

export default class Top10Tab extends React.Component<{}, Top10State> {
  public state: Top10State = {
    response: undefined,
    fetching: false,
    fetched: false,
    fetchFailed: false,
    fetchError: undefined
  };

  public componentDidMount() {
    this.fetchTop10();
  }

  public render() {
    return (
      <div className="top10-panel r2c-guide-panel">
        {this.state.fetching && <Top10Fetching />}
        {this.state.fetchError && <Top10Failed />}
        {this.state.response && (
          <section className="top10-popular top10-section">
            <h2>Most voted repos</h2>
            {this.state.response.mostVoted.map((item, i) => (
              <VotedRepoEntry key={i} {...item} />
            ))}
          </section>
        )}
        {this.state.response && (
          <section className="top10-controversial top10-section">
            <h2>Most controversial repos</h2>
            {this.state.response.mostControversial.map((item, i) => (
              <ControversialRepoEntry key={i} {...item} />
            ))}
          </section>
        )}
      </div>
    );
  }

  private fetchTop10 = async () => {
    this.setState({
      response: undefined,
      fetching: true,
      fetched: false,
      fetchFailed: false,
      fetchError: undefined
    });
    try {
      const response = await getVoteOverview();
      this.setState({
        fetching: false,
        fetched: true,
        fetchFailed: false,
        fetchError: undefined,
        response
      });
    } catch (e) {
      this.setState({
        fetching: false,
        fetched: false,
        fetchFailed: true,
        fetchError: e
      });
    }
  };
}
