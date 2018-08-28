import "./Share.css";

import * as classnames from "classnames";
import * as React from "react";

import { UserProps } from "@r2c/extension/shared/User";

type ShareSectionProps = UserProps;

export default class ShareSection extends React.Component<ShareSectionProps> {
  public render() {
    return (
      <div className={classnames("twist", "share-twist")}>
        {"hello buttons!"}
      </div>
    );
  }
}
