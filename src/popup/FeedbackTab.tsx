import * as React from "react";
import IntercomHook from "./IntercomHook";

interface FeedbackTabProps {
  user: string | undefined;
}

export default class FeedbackTab extends React.PureComponent<FeedbackTabProps> {
  public render() {
    const { user } = this.props;

    return <IntercomHook name={user} />;
  }
}
