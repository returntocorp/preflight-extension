import "./Discussion.css";

import * as classnames from "classnames";
import * as React from "react";

import { Button, InputGroup, NonIdealState } from "@blueprintjs/core";
import {
  CommentPostBody,
  DiscussionComment,
  getComments,
  submitComment
} from "@r2c/extension/api/comments";

import { UserProps } from "@r2c/extension/shared/User";
import { UserMetadataFooter } from "@r2c/extension/shared/UserMetadata";
import { userOrInstallationId } from "@r2c/extension/utils";
import { truncate } from "lodash";

interface DiscussionCommentState {
  fullHeight: boolean;
}

class CommentItem extends React.Component<
  DiscussionComment,
  DiscussionCommentState
> {
  public state: DiscussionCommentState = {
    fullHeight: false
  };

  private TEXT_OVERSIZE_LIMIT = 140;

  public render() {
    const { text, author, created, inFlight } = this.props;
    const displayText = this.state.fullHeight
      ? text
      : truncate(text, {
          length: this.TEXT_OVERSIZE_LIMIT,
          separator: ".,:? +"
        });

    return (
      <article
        className={classnames("discussion-comment", {
          "in-flight": inFlight,
          "full-height": this.state.fullHeight
        })}
      >
        <section className="comment-body">
          <div className="comment-body-text">{displayText}</div>
          {text.length > this.TEXT_OVERSIZE_LIMIT && (
            <div className="comment-body-show-more">
              <a onClick={this.toggleFullHeight} role="button">
                {this.state.fullHeight ? "Show less" : "Read more"}
              </a>
            </div>
          )}
        </section>
        <UserMetadataFooter
          user={author}
          timestamp={created}
          className="comment-meta"
          loading={inFlight}
        />
      </article>
    );
  }

  private toggleFullHeight: React.MouseEventHandler<HTMLAnchorElement> = e => {
    this.setState({ fullHeight: !this.state.fullHeight });
  };
}

interface CommentsWellProps {
  comments: DiscussionComment[] | undefined;
}

class CommentsWell extends React.PureComponent<CommentsWellProps> {
  private commentWellEnd = React.createRef<HTMLDivElement>();

  constructor(props: CommentsWellProps) {
    super(props);
  }

  public componentDidMount() {
    this.scrollToEnd();
  }

  public componentDidUpdate() {
    this.scrollToEnd();
  }

  public render() {
    const { comments } = this.props;
    if (comments == null || comments.length === 0) {
      return (
        <div className="comments-well comments-well-empty">
          <NonIdealState
            icon={
              <svg width="24" height="24" fillRule="evenodd" clipRule="evenodd">
                <path d="M24 20h-3v4l-5.333-4h-7.667v-4h2v2h6.333l2.667 2v-2h3v-8.001h-2v-2h4v12.001zm-15.667-6l-5.333 4v-4h-3v-14.001l18 .001v14h-9.667zm-6.333-2h3v2l2.667-2h8.333v-10l-14-.001v10.001z" />
              </svg>
            }
            description="Be the first to comment"
          />
        </div>
      );
    } else {
      return (
        <div className="comments-well">
          {comments.map((comment, i) => (
            <CommentItem key={i} {...comment} />
          ))}
          <div className="comments-well-end" ref={this.commentWellEnd} />
        </div>
      );
    }
  }

  private scrollToEnd = () => {
    if (this.commentWellEnd.current != null) {
      this.commentWellEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  };
}

type DiscussionProps = UserProps;

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
          : [inFlightComment],
      inputText: ""
    });
    submitComment(body).then(({ comments, recorded }) => {
      if (recorded) {
        this.setState({ comments });
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
