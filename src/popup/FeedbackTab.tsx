import { AnchorButton, Button, Intent, NonIdealState } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import * as classnames from "classnames";
import * as React from "react";
import { getBrowserType } from "../utils";
import "./FeedbackTab.css";
import IntercomHook from "./IntercomHook";

interface FeedbackTabProps {
  user: string | undefined;
  installationId: string | undefined;
}

export default class FeedbackTab extends React.PureComponent<FeedbackTabProps> {
  public render() {
    const { user, installationId } = this.props;
    const browserType = getBrowserType();
    const intercomSupported =
      browserType === "chrome" || browserType === "firefox";

    return (
      <div className={classnames("r2c-guide-panel", "feedback-panel")}>
        <NonIdealState
          icon={IconNames.AIRPLANE}
          title="Drop us a line"
          description={
            <div className="feedback-panel-description">
              <span className="instructions">
                <p>Thank you for taking the time to give us feedback!</p>
                <p>
                  We'd love to hear any and all questions, comments, and
                  concerns.
                </p>
              </span>
            </div>
          }
          action={
            <>
              <Button
                className="r2c-feedback-button"
                onClick={this.showIntercom}
                intent={Intent.SUCCESS}
                disabled={!intercomSupported}
              >
                Chat with us on Intercom
              </Button>
              <AnchorButton href="mailto:preflight@returntocorp.com" target="_blank" rel="noopener noreferrer">
                Or, send us an email
              </AnchorButton>
            </>
          }
        />

        {intercomSupported && (
          <div className="intercom-hint">
            <p>
              If Intercom doesn't appear, you might need to disable Tracking
              Protection or your adblocker.
            </p>
            <p>
              We take your privacy seriously. For more information on how we use
              Intercom,{" "}
              <a
                href="https://github.com/returntocorp/preflight-extension/blob/master/PRIVACY.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                see our Privacy document
              </a>
              .
            </p>
          </div>
        )}

        {intercomSupported && (
          <IntercomHook
            name={user}
            user_id={installationId}
            hide_default_launcher={true}
          />
        )}

        {!intercomSupported && (
          <div className="intercom-hint">
            <p>
              Due to limitations in browser extension support, we can only chat
              with Intercom in Chrome or Firefox.
            </p>
          </div>
        )}
      </div>
    );
  }

  private showIntercom: React.MouseEventHandler<HTMLElement> = e => {
    window.Intercom("showMessages");
  };
}
