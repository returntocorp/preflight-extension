import { Button, InputGroup } from "@blueprintjs/core";
import * as classnames from "classnames";
import * as React from "react";
import "./Discussion.css";

const DiscussionComment: React.SFC<DiscussionComment> = ({
  text,
  user,
  timestamp
}) => (
  <article className="discussion-comment">
    <section className="comment-body">{text}</section>
    <footer className="comment-meta">
      <span className="comment-user">
        <img
          src={`https://github.com/${user}.png`}
          className="comment-user-profile-pic"
          role="presentation"
          alt=""
        />{" "}
        <span className="comment-user-handle">{user}</span>
      </span>
      <span className="timestamp">{timestamp.toLocaleDateString()}</span>
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

interface DiscussionComment {
  text: string;
  user: string;
  timestamp: Date;
  reactions?: DiscussionReactions;
}

interface DiscussionReactions {
  [emoji: string]: number;
}

interface CommentsState {
  comments: DiscussionComment[] | undefined;
  inputText: string;
}

export default class Discussion extends React.Component<{}, CommentsState> {
  public state: CommentsState = {
    comments: [
      {
        user: "ievans",
        text: "hello world",
        timestamp: new Date(2018, 4, 7, 3, 1, 2)
      },
      {
        user: "dlukeomalley",
        text: "this sucks",
        timestamp: new Date(2018, 2, 3, 4, 5, 6),
        reactions: {
          "🤔": 5
        }
      }
    ],
    inputText: ""
  };

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
