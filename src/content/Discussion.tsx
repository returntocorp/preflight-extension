import { Button, InputGroup, Spinner } from "@blueprintjs/core";
import {
  CommentPostBody,
  DiscussionComment,
  getComments,
  submitComment
} from "@r2c/extension/api/comments";
import { userOrInstallationId } from "@r2c/extension/utils";
import * as classnames from "classnames";
import * as React from "react";
import "./Discussion.css";

// TODO: Move this to separate file
interface TwistProps {
  user: string | undefined;
  installationId: string;
}

const DiscussionComment: React.SFC<DiscussionComment> = ({
  text,
  author,
  created,
  inFlight
}) => (
  <article
    className={classnames("discussion-comment", { "in-flight": inFlight })}
  >
    <section className="comment-body">{text}</section>
    <footer className="comment-meta">
      <span className="comment-user">
        <img
          src={`https://github.com/${author}.png`}
          className="comment-user-profile-pic"
          role="presentation"
          alt=""
        />{" "}
        <span className="comment-user-handle">
          <a
            href={`https://github.com/${author}`}
            title={`${author}'s profile`}
          >
            {author}
          </a>
        </span>
      </span>
      <span className="timestamp">
        {inFlight && <Spinner size={12} className="in-flight-spinner" />}
        {new Date(created).toLocaleDateString()}
      </span>
    </footer>
  </article>
);

interface CommentsWellProps {
  comments: DiscussionComment[] | undefined;
}

const CommentsWell: React.SFC<CommentsWellProps> = ({ comments }) => {
  if (comments == null || comments.length === 0) {
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

type DiscussionProps = TwistProps;

interface CommentsState {
  comments: DiscussionComment[] | undefined;
  fetching: boolean;
  fetched: boolean;
  fetchFailed: boolean;
  fetchError: string | undefined;
  submitFailed: boolean;
  inputText: string;
}

export default class Discussion extends React.Component<
  DiscussionProps,
  CommentsState
> {
  public state: CommentsState = {
    comments: undefined,
    inputText: "",
    fetching: false,
    fetched: false,
    fetchFailed: false,
    fetchError: undefined,
    submitFailed: false
  };

  public componentDidMount() {
    this.refreshComments();
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
              rightElement={
                <Button minimal={true} onClick={this.handleSubmitComment}>
                  Send
                </Button>
              }
              type={this.state.inputText.length > 50 ? "textarea" : "text"}
              value={this.state.inputText}
              placeholder="Type a message..."
              onChange={this.handleInputChange}
              onKeyPress={this.handleCommentInputEnter}
              dir="auto"
            />
          </div>
        </div>
      </div>
    );
  }

  private handleInputChange: React.FormEventHandler<HTMLInputElement> = e => {
    this.setState({ inputText: e.currentTarget.value });
  };

  private handleCommentInputEnter: React.KeyboardEventHandler<
    HTMLInputElement
  > = e => {
    if (e.key === "Enter") {
      this.handleSubmitComment(e);
    }
  };

  private handleSubmitComment: React.FormEventHandler<HTMLElement> = e => {
    console.log("Submitting comment");

    const body = {
      user: userOrInstallationId(this.props.user, this.props.installationId),
      text: this.state.inputText.trim()
    };

    const inFlightComment = this.buildInFlightComment(body);
    this.setState({
      submitFailed: false,
      comments:
        this.state.comments != null
          ? [...this.state.comments, inFlightComment]
          : [inFlightComment]
    });
    submitComment(body).then(({ comments, recorded }) => {
      if (recorded) {
        this.setState({ comments, inputText: "" });
      } else {
        this.setState({ submitFailed: true });
      }
    });
  };

  private buildInFlightComment = (body: CommentPostBody): DiscussionComment => {
    return {
      author: body.user,
      text: body.text,
      created: new Date().toLocaleString(),
      inFlight: true
    };
  };

  private refreshComments = () => {
    getComments().then(
      ({ comments }) => {
        this.setState({ comments });
      },
      err => {
        this.setState({});
      }
    );
  };
}
