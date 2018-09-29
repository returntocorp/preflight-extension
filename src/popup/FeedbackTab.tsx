import { AnchorButton, NonIdealState } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import * as classnames from "classnames";
import * as React from "react";
import IntercomHook from "./IntercomHook";

interface FeedbackTabProps {
  user: string | undefined;
  installationId: string | undefined;
}

export default class FeedbackTab extends React.PureComponent<FeedbackTabProps> {
  public render() {
    const { user, installationId } = this.props;

    return (
      <div className={classnames("r2c-guide-panel", "feedback-panel")}>
        <NonIdealState
          icon={IconNames.AIRPLANE}
          title="Drop us a line"
          description="Use the Intercom button below to message us directly. If you don't see a button, you might need to disable Tracking Protection, or use a browser with different security policies."
          action={
            <AnchorButton href="mailto:preflight@ret2.co">
              Or, send us an email
            </AnchorButton>
          }
        />
        <IntercomHook name={user} user_id={installationId} />
      </div>
    );
  }
}
