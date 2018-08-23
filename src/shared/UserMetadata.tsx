import { Spinner } from "@blueprintjs/core";
import ProfileBadge from "@r2c/extension/shared/ProfileBadge";
import * as classnames from "classnames";
import * as React from "react";
import "./UserMetadata.css";
// tslint:disable:no-var-requires
// tslint:disable-next-line:no-require-imports
const Timeago = require("react-timeago").default;
// tslint:enable:no-var-requires

export interface UserMetadataFooterProps {
  className?: string;
  user?: string;
  timestamp?: string;
  hideProfilePicture?: boolean;
  loading?: boolean;
}

export const UserMetadataFooter: React.SFC<UserMetadataFooterProps> = ({
  className,
  user,
  timestamp,
  hideProfilePicture,
  loading
}) => (
  <footer className={classnames("user-meta", className)}>
    {user != null && (
      <ProfileBadge user={user} hideProfilePicture={hideProfilePicture} />
    )}
    {loading && <Spinner size={12} className="in-flight-spinner" />}
    {timestamp != null && (
      <span className="timestamp">
        <Timeago date={timestamp} />
      </span>
    )}
  </footer>
);
