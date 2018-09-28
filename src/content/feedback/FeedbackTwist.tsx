import * as classnames from "classnames";
import * as React from "react";
import IntercomHook from "./IntercomHook";

interface FeedbackTwistProps {
  user: string | undefined;
  installationId: string;
}

export default class FeedbackTwist extends React.PureComponent<
  FeedbackTwistProps
> {
  public render() {
    const { user, installationId } = this.props;

    return (
      <div className={classnames("twist", "preflight-twist")}>
        <IntercomHook
          hide_default_launcher={true}
          name={user}
          user_id={installationId}
        />
      </div>
    );
  }
}
