import { Button, InputGroup } from "@blueprintjs/core";
import { DiscussionComment, getComments } from "@r2c/extension/api/comments";
import * as classnames from "classnames";
import * as React from "react";
import "./Discussion.css";

const DiscussionComment: React.SFC<DiscussionComment> = ({
  text,
  author,
  created
}) => (
  <article className="discussion-comment">
    <section className="comment-body">{text}</section>
    <footer className="comment-meta">
      <span className="comment-user">
        <img
          src={`https://github.com/${author}.png`}
          className="comment-user-profile-pic"
          role="presentation"
          alt=""
        />{" "}
        <span className="comment-user-handle">{author}</span>
      </span>
      <span className="timestamp">
        {new Date(created).toLocaleDateString()}
      </span>
    </footer>
  </article>
);

interface CommentsWellProps {
  comments: DiscussionComment[] | undefined;
}

const CommentsWell: React.SFC<CommentsWellProps> = ({ comments }) => {
  if (comments == null) {
    return (
      <div className="comments-well comments-well-empty">
        Be the first to comment
      </div>
    );
  } else {
    return (
      <div className="comments-well">
        {comments.map((comment, i) => (
          <DiscussionComment key={i} {...comment} />
        ))}
      </div>
    );
  }
};

interface CommentsState {
  comments: DiscussionComment[] | undefined;
  fetching: boolean;
  fetched: boolean;
  fetchFailed: boolean;
  fetchError: string | undefined;
  inputText: string;
}

export default class Discussion extends React.Component<{}, CommentsState> {
  public state: CommentsState = {
    comments: undefined,
    inputText: "",
    fetching: false,
    fetched: false,
    fetchFailed: false,
    fetchError: undefined
  };

  public componentDidMount() {
    getComments().then(
      ({ comments }) => {
        this.setState({ comments });
      },
      err => {
        this.setState({});
      }
    );
  }

  public render() {
    return (
      <div className={classnames("twist", "comment-twist")}>
        <header className="twist-header">
          <h1 className="twist-title">Discussion</h1>
        </header>
        <div className="twist-body">
          <CommentsWell comments={this.state.comments} />
          <div className="comment-input">
            <InputGroup
              rightElement={<Button minimal={true}>Send</Button>}
              value={this.state.inputText}
              placeholder="Type a message..."
              onChange={this.handleInputChange}
            />
          </div>
        </div>
      </div>
    );
  }

  private handleInputChange: React.FormEventHandler<HTMLInputElement> = e => {
    this.setState({ inputText: e.currentTarget.value });
  };
}
