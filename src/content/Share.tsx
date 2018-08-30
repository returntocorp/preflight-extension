import "./Share.css";

import { InputGroup } from "@blueprintjs/core";
import * as classnames from "classnames";
import * as copy from "copy-to-clipboard";
import * as React from "react";

import { CopyButton } from "@r2c/extension/shared/CopyButton";
import { UserProps } from "@r2c/extension/shared/User";

type ShareSectionProps = UserProps & {
  rtcLink: string;
  shortDesc: string;
  onLinkClick: React.MouseEventHandler<HTMLElement> | undefined;
  onEmailClick: React.MouseEventHandler<HTMLElement> | undefined;
};
export type ShareActionType = "link" | "email";

interface ShareSectionState {
  clickedEmail: boolean;
  clickedLink: boolean;
}

interface EmailIconProps {
  hovered: boolean;
}

interface LinkIconProps {
  hovered: boolean;
}

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
    clickedEmail: false,
    clickedLink: false
  };

  public render() {
    const { rtcLink, shortDesc } = this.props;

    return (
      <div className={classnames("twist", "share-twist")}>
        <header className="twist-header">
          <h1 className="twist-title">Share R2C!</h1>
        </header>
        <div className="twist-body">{this.props.shortDesc}</div>
        <div>
          <InputGroup
            type="text"
            value={this.props.rtcLink}
            rightElement={<CopyButton onClick={this.onCopyLinkClick} />}
            readOnly={true}
          />
        </div>
        <div className="share-actions">
          <a
            className={classnames("r2c-action-button")}
            title="Email"
            data-sharemenu-action="email"
            data-sharemenu-track="email"
            href={`mailto:?subject=${shortDesc}&body=${rtcLink}`}
            role="button"
            onClick={this.onEmailLinkClick}
          >
            <EmailIcon hovered={false} />
          </a>
          <a
            className={classnames("r2c-action-button")}
            data-sharemenu-action="link"
            title="LinkButton"
            role="button"
            onClick={this.onCopyLinkClick}
          >
            <LinkIcon hovered={false} />
          </a>
        </div>
      </div>
    );
  }

  private onEmailLinkClick: React.MouseEventHandler<HTMLElement> = e => {
    const { onEmailClick } = this.props;
    if (onEmailClick) {
      onEmailClick(e);
    }
  };

  private onCopyLinkClick: React.MouseEventHandler<HTMLElement> = e => {
    const { onLinkClick } = this.props;
    copy(this.props.rtcLink);
    if (onLinkClick) {
      onLinkClick(e);
    }
  };
}
