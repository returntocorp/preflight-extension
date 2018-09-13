import * as classnames from "classnames";
import * as React from "react";
import "./PreflightTwist.css";

export default class PreflightTwist extends React.PureComponent {
  public render() {
    return (
      <div className={classnames("twist", "preflight-twist")}>
        <header className="twist-header">
          <h1 className="twist-title">Manifest</h1>
        </header>
      </div>
    );
  }
}
