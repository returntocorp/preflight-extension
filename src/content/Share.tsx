import "./Share.css";

import * as classnames from "classnames";
import * as React from "react";

import { UserProps } from "@r2c/extension/shared/User";

type ShareSectionProps = UserProps & {
  rtcLink: string;
  shortDesc: string;
  onTweetClick: React.MouseEventHandler<HTMLElement>;
  onLinkClick: React.MouseEventHandler<HTMLElement>;
  onEmailClick: React.MouseEventHandler<HTMLElement>;
};
export type ShareActionType = "tweet" | "link" | "email";

interface ShareSectionState {
  clickedTweet: boolean;
  clickedEmail: boolean;
  clickedLink: boolean;
}

interface TweetIconProps {
  hovered: boolean;
}

interface EmailIconProps {
  hovered: boolean;
}

interface LinkIconProps {
  hovered: boolean;
}

const TweetIcon: React.SFC<TweetIconProps> = ({ hovered }) => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M0 0v24h24v-24h-24zm18.862 9.237c.208 4.617-3.235 9.765-9.33 9.765-1.854 0-3.579-.543-5.032-1.475 1.742.205 3.48-.278 4.86-1.359-1.437-.027-2.649-.976-3.066-2.28.515.098 1.021.069 1.482-.056-1.579-.317-2.668-1.739-2.633-3.26.442.246.949.394 1.486.411-1.461-.977-1.875-2.907-1.016-4.383 1.619 1.986 4.038 3.293 6.766 3.43-.479-2.053 1.079-4.03 3.198-4.03.944 0 1.797.398 2.396 1.037.748-.147 1.451-.42 2.085-.796-.245.767-.766 1.41-1.443 1.816.664-.08 1.297-.256 1.885-.517-.44.656-.997 1.234-1.638 1.697z" />
  </svg>
);

const EmailIcon: React.SFC<EmailIconProps> = ({ hovered }) => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l-12-9.725v15.438h24v-15.438l-12 9.725z" />
  </svg>
);

const LinkIcon: React.SFC<LinkIconProps> = ({ hovered }) => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M6 17c2.269-9.881 11-11.667 11-11.667v-3.333l7 6.637-7 6.696v-3.333s-6.17-.171-11 5zm12 .145v2.855h-16v-12h6.598c.768-.787 1.561-1.449 2.339-2h-10.937v16h20v-6.769l-2 1.914z" />
  </svg>
);

export class ShareSection extends React.Component<
  ShareSectionProps,
  ShareSectionState
> {
  public state: ShareSectionState = {
    clickedTweet: false,
    clickedEmail: false,
    clickedLink: false
  };

  public render() {
    const { rtcLink, shortDesc } = this.props;

    return (
      <div className={classnames("twist", "share-twist")}>
        <header className="twist-header">
          <h1 className="twist-title">Share R2C Findings</h1>
        </header>
        <div className="twist-body">
          <h3> My findings to share!</h3>
        </div>
        <a
          className={classnames("r2c-action-button", "share-action")}
          title="TweetButton"
          role="button"
          onClick={this.props.onTweetClick}
          rel="noopener noreferrer"
          target="_blank"
          href={`https://twitter.com/intent/tweet?text=${shortDesc}&url=${rtcLink}&via=returntocorp`}
        >
          <div className="tweet-icon">
            <TweetIcon hovered={false} />
          </div>
        </a>
        <a
          className={classnames("r2c-action-button", "email-action")}
          title="Email"
          data-sharemenu-action="email"
          data-sharemenu-track="email"
          href={`mailto:?subject=${shortDesc}&body=${rtcLink}`}
          role="button"
          onClick={this.props.onEmailClick}
        >
          <EmailIcon hovered={false} />
        </a>
        <a
          className={classnames("r2c-action-button", "link-action")}
          data-sharemenu-action="link"
          title="LinkButton"
          role="button"
          onClick={this.onCopyLinkClick}
        >
          <LinkIcon hovered={false} />
        </a>
      </div>
    );
  }

  private onCopyLinkClick: React.MouseEventHandler<HTMLAnchorElement> = e => {
    const el = document.createElement("textarea");
    el.value = this.props.rtcLink;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    this.props.onLinkClick(e);
    document.body.removeChild(el);
  };
}
