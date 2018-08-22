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
    {hideProfilePicture ? null : (
      <img
        src={
          user.startsWith("anonymous")
            ? undefined
            : `https://github.com/${user}.png`
        }
        className="user-profile-pic"
        role="presentation"
        alt=""
      />
    )}{" "}
    <span className="user-profile-handle">{user}</span>
  </span>
);

export default ProfileBadge;
