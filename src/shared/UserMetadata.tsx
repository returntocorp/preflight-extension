import { Spinner } from "@blueprintjs/core";
import ProfilePicture from "@r2c/extension/shared/ProfilePicture";
import * as classnames from "classnames";
import * as React from "react";
import Timeago from "react-timeago";
import "./UserMetadata.css";

export interface ProfileBadgeProps {
  user: string;
  hideProfilePicture?: boolean;
}

const ProfileBadge: React.SFC<ProfileBadgeProps> = ({
  user,
  hideProfilePicture
}) => (
  <span className="user-profile">
    {hideProfilePicture ? null : <ProfilePicture user={user} />}{" "}
    <span className="user-profile-handle">{user}</span>
  </span>
);

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
