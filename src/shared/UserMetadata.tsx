import { Spinner } from "@blueprintjs/core";
import * as classnames from "classnames";
import * as React from "react";
import "./UserMetadata.css";
// tslint:disable:no-var-requires
// tslint:disable-next-line:no-require-imports
const Timeago = require("react-timeago").default;
// tslint:enable:no-var-requires

export interface UserMetadataFooterProps {
  className?: string;
  author: string;
  timestamp?: string;
  hideProfilePicture?: boolean;
  loading?: boolean;
}

export const UserMetadataFooter: React.SFC<UserMetadataFooterProps> = ({
  className,
  author,
  timestamp,
  hideProfilePicture,
  loading
}) => (
  <footer className={classnames("user-meta", className)}>
    <span className="user-author">
      {hideProfilePicture ? null : (
        <img
          src={
            author.startsWith("anonymous")
              ? undefined
              : `https://github.com/${author}.png`
          }
          className="user-author-profile-pic"
          role="presentation"
          alt=""
        />
      )}{" "}
      <span className="user-author-handle">{author}</span>
    </span>
    {loading && <Spinner size={12} className="in-flight-spinner" />}
    {timestamp != null && (
      <span className="timestamp">
        <Timeago date={timestamp} />
      </span>
    )}
  </footer>
);
