import { NonIdealState, Spinner } from "@blueprintjs/core";
import { FirehoseActivity, getFirehose } from "@r2c/extension/api/firehose";
import ProfilePicture from "@r2c/extension/shared/ProfilePicture";
import { UserMetadataFooter } from "@r2c/extension/shared/UserMetadata";
import { getSlugFromUrl } from "@r2c/extension/utils";
import { truncate } from "lodash";
import * as React from "react";
import "./FirehoseTab.css";

const VoteActivityBody: React.SFC<FirehoseActivity> = ({
  author,
  gitUrl,
  actionValue
}) => (
  <span className="activity-body vote-activity-body">
    <span className="activity-body-author">{author}</span> voted{" "}
    <span className="activity-body-value">{actionValue}</span> on{" "}
    <span className="activity-body-giturl">
      <a href={gitUrl}>{getSlugFromUrl(gitUrl)}</a>
    </span>
  </span>
);

const MentionActivityBody: React.SFC<FirehoseActivity> = ({
  author,
  gitUrl,
  actionValue
}) => (
  <span className="activity-body mention-activity-body">
    <span className="activity-body-author">{author}</span> mentioned{" "}
    <span className="activity-body-value">{actionValue}</span> on{" "}
    <span className="activity-body-giturl">
      <a href={gitUrl}>{getSlugFromUrl(gitUrl)}</a>
    </span>
  </span>
);

const CommentActivityBody: React.SFC<FirehoseActivity> = ({
  author,
  gitUrl,
  actionValue
}) => (
  <span className="activity-body comment-activity-body">
    <span className="activity-body-author">{author}</span> commented on{" "}
    <span className="activity-body-giturl">
      <a href={gitUrl}>{getSlugFromUrl(gitUrl)}</a>
    </span>
    :{" "}
    <span className="activity-body-value">
      {truncate(actionValue, { length: 30 })}
    </span>
  </span>
);

const ActivityItem: React.SFC<FirehoseActivity> = activity => (
  <article className="firehose-activity">
    <ProfilePicture user={activity.author} className="activity-profile-pic" />
    <section className="activity-contents">
      {activity.action === "vote" && <VoteActivityBody {...activity} />}
      {activity.action === "mention" && <MentionActivityBody {...activity} />}
      {activity.action === "comment" && <CommentActivityBody {...activity} />}
      <UserMetadataFooter
        timestamp={activity.timestamp}
        className="activity-meta"
      />
    </section>
  </article>
);

interface ActivitiesListProps {
  activities: FirehoseActivity[];
}

const ActivitiesList: React.SFC<ActivitiesListProps> = ({ activities }) => (
  <div className="activities-list">
    <div className="activities-list-start" />
    {activities.map((activity, i) => (
      <ActivityItem key={i} {...activity} />
    ))}
    <div className="activities-list-end" />
  </div>
);

const FirehoseFetching: React.SFC = () => (
  <div className="firehose-fetching">
    <NonIdealState icon={<Spinner />} title="Drinking from the firehose..." />
  </div>
);

const FirehoseFailed: React.SFC = () => (
  <div className="firehose-failed">
    <NonIdealState title="Couldn't load firehose" />
  </div>
);

interface FirehoseState {
  activities: FirehoseActivity[] | undefined;
  fetching: boolean;
  fetched: boolean;
  fetchFailed: boolean;
  fetchError: string | undefined;
}

export default class FirehoseTab extends React.Component<{}, FirehoseState> {
  public state: FirehoseState = {
    activities: undefined,
    fetching: false,
    fetched: false,
    fetchFailed: false,
    fetchError: undefined
  };

  public componentDidMount() {
    this.fetchFirehose();
  }

  public render() {
    return (
      <div className="firehose-panel r2c-guide-panel">
        {this.state.fetching && <FirehoseFetching />}
        {this.state.fetchError && <FirehoseFailed />}
        {this.state.activities != null && (
          <ActivitiesList activities={this.state.activities} />
        )}
      </div>
    );
  }

  private fetchFirehose = async () => {
    this.setState({
      activities: undefined,
      fetching: true,
      fetched: false,
      fetchFailed: false,
      fetchError: undefined
    });
    try {
      const response = await getFirehose();
      this.setState({
        fetching: false,
        fetched: true,
        fetchFailed: false,
        fetchError: undefined,
        activities: response.activity
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
