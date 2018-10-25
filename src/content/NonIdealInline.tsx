import { Icon, IconName, Intent } from "@blueprintjs/core";
import * as classnames from "classnames";
import * as React from "react";
import "./NonIdealInline.css";

interface NonIdealInlineProps {
  message: string;
  intent?: Intent;
  className?: string;
  muted?: boolean;
  icon?: IconName | JSX.Element;
}

export default class NonIdealInline extends React.PureComponent<
  NonIdealInlineProps
> {
  public render() {
    const { message, className, muted } = this.props;

    return (
      <div
        className={classnames("nonideal-inline", className, {
          "nonideal-inline-muted": muted
        })}
      >
        {this.maybeRenderVisual()}
        <span className="nonideal-inline-message">{message}</span>
      </div>
    );
  }

  // Inspired by blueprintjs NonIdealState
  private maybeRenderVisual = () => {
    const { icon, intent } = this.props;

    if (icon == null) {
      return null;
    } else {
      return (
        <div className="nonideal-inline-icon-wrapper">
          <Icon icon={icon} intent={intent} className="nonideal-inline-icon" />
        </div>
      );
    }
  };
}
