import { NonIdealState, Spinner } from "@blueprintjs/core";
import {
  CommentMention,
  CommentMentionsResponse,
  getCommentMentions
} from "@r2c/extension/api/comments";
import ProfilePicture from "@r2c/extension/shared/ProfilePicture";
import { UserMetadataFooter } from "@r2c/extension/shared/UserMetadata";
import { getSlugFromUrl } from "@r2c/extension/utils";
import { truncate } from "lodash";
import * as React from "react";
import "./ProfileTab.css";

const ProfileFetching: React.SFC = () => (
  <div className="profile-fetching">
    <NonIdealState icon={<Spinner />} title="Mixing networks..." />
  </div>
);

const ProfileFailed: React.SFC = () => (
  <div className="profile-failed">
    <NonIdealState title="Couldn't load profile" />
  </div>
);

const NoMentions: React.SFC = () => (
  <div className="profile-empty">
    <NonIdealState
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M10.041 17l-4.5-4.319 1.395-1.435 3.08 2.937 7.021-7.183 1.422 1.409-8.418 8.591zm5.959-17v2h-8v-2h8zm0 24v-2h-8v2h8zm2-22h4v4h2v-6h-6v2zm-18 14h2v-8h-2v8zm2-10v-4h4v-2h-6v6h2zm22 2h-2v8h2v-8zm-2 10v4h-4v2h6v-6h-2zm-16 4h-4v-4h-2v6h6v-2z" />
        </svg>
      }
      title="Nothing in your inbox"
    />
  </div>
);

const MentionItem: React.SFC<CommentMention> = ({
  gitUrl,
  author,
  text,
  timestamp
}) => (
  <article className="profile-mention">
    <ProfilePicture user={author} className="profile-mention-profile-pic" />
    <section className="popular-contents">
      <span className="popular-author">{author}</span> mentioned you on{" "}
      <span className="popular-giturl">
        <a href={gitUrl} target="_blank" rel="noreferrer noopener">
          {getSlugFromUrl(gitUrl)}
        </a>
      </span>
      : <br />
      <span className="popular-mention-text">
        {truncate(text, { length: 30 })}
      </span>
      <UserMetadataFooter
        timestamp={timestamp}
        className="profile-mention-meta"
      />
    </section>
  </article>
);

interface ProfileTabProps {
  user: string;
}

interface ProfileTabState {
  response: CommentMentionsResponse | undefined;
  fetching: boolean;
  fetched: boolean;
  fetchFailed: boolean;
  fetchError: string | undefined;
}

export default class ProfileTab extends React.Component<
  ProfileTabProps,
  ProfileTabState
> {
  public state: ProfileTabState = {
    response: undefined,
    fetching: false,
    fetched: false,
    fetchFailed: false,
    fetchError: undefined
  };

  public componentDidMount() {
    this.fetchProfile();
  }

  public render() {
    return (
      <div className="profile-panel r2c-guide-panel">
        {this.state.fetching && <ProfileFetching />}
        {this.state.fetchError && <ProfileFailed />}
        {this.state.response && (
          <section className="profile-mention profile-section">
            {this.state.response.mentions.length === 0 && <NoMentions />}
            {this.state.response.mentions.length > 0 && (
              <>
                <h2>You were mentioned in</h2>
                <div className="mentions-list">
                  {this.state.response.mentions.map((item, i) => (
                    <MentionItem key={i} {...item} />
                  ))}
                </div>
              </>
            )}
          </section>
        )}
      </div>
    );
  }

  private fetchProfile = async () => {
    this.setState({
      response: undefined,
      fetching: true,
      fetched: false,
      fetchFailed: false,
      fetchError: undefined
    });
    try {
      const response = await getCommentMentions(this.props.user);
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
