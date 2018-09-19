import { Tooltip } from "@blueprintjs/core";
import { l } from "@r2c/extension/analytics";
import {
  buildGithubProfilePicUrl,
  buildGithubProfileUrl
} from "@r2c/extension/utils";
import * as classnames from "classnames";
import * as React from "react";

interface ProfilePictureImageProps {
  user: string;
  className?: string;
}

interface ProfilePictureProps extends ProfilePictureImageProps {
  showTooltip?: boolean;
  linkToUser?: boolean;
}

const ProfilePictureImage: React.SFC<ProfilePictureImageProps> = ({
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

const LinkedProfilePicture: React.SFC<ProfilePictureProps> = ({
  user,
  className,
  linkToUser
}) =>
  linkToUser ? (
    <a
      href={buildGithubProfileUrl(user)}
      role="button"
      onClick={l("profile-picture-click", undefined, { user, className })}
    >
      <ProfilePictureImage user={user} className={className} />
    </a>
  ) : (
    <ProfilePictureImage user={user} className={className} />
  );

const ProfilePicture: React.SFC<ProfilePictureProps> = ({
  showTooltip,
  user,
  ...rest
}) =>
  showTooltip ? (
    <Tooltip content={user}>
      <LinkedProfilePicture user={user} {...rest} />
    </Tooltip>
  ) : (
    <LinkedProfilePicture user={user} {...rest} />
  );

export default ProfilePicture;
