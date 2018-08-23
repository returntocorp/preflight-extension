import { buildGithubProfilePicUrl } from "@r2c/extension/utils";
import * as classnames from "classnames";
import * as React from "react";

interface ProfilePictureProps {
  user: string;
  className?: string;
}

const ProfilePicture: React.SFC<ProfilePictureProps> = ({
  user,
  className
}) => (
  <img
    src={
      user.startsWith("anonymous") ? undefined : buildGithubProfilePicUrl(user)
    }
    className={classnames("user-profile-pic", className)}
    role="presentation"
    alt=""
  />
);

export default ProfilePicture;
