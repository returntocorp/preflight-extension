import ProfilePicture from "@r2c/extension/shared/ProfilePicture";
import * as React from "react";
import "./ProfileBadge.css";

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

export default ProfileBadge;
