import * as classnames from "classnames";
import * as React from "react";
import { getExtensionUrl } from "../utils";
import "./FeedbackTwist.css";

export default class FeedbackTwist extends React.PureComponent {
  public render() {
    return (
      <div className={classnames("twist", "feedback-twist")}>
        <div className="twist-body">
          <iframe src={getExtensionUrl("frames/feedback.html")} sandbox="" />
        </div>
      </div>
    );
  }
}
