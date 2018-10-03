import { Button, Icon, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import * as React from "react";
import "./ExceptionalHeadsUp.css";

export default class ExceptionalHeadsUp extends React.PureComponent {
  public render() {
    return (
      <div className="r2c-repo-headsup exceptional-headsup">
        <header>
          <h1>Danger, Will Robinson!</h1>
        </header>
        <div className="repo-headsup-body">
          <div className="repo-headsup-icon">
            <Icon icon={IconNames.WARNING_SIGN} iconSize={24} />
          </div>
          <div className="repo-headsup-message">
            <h2>There's a known vulnerability in this package</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse pretium, libero eu varius dignissim, lorem turpis
              maximus dolor, sit amet pharetra enim felis in odio. In hac
              habitasse platea dictumst.
            </p>
            <div className="repo-headsup-message-actions">
              <Button intent={Intent.WARNING}>Show vulnerability info</Button>
              <Button minimal={true}>
                Show me the preflight checks anyways
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
