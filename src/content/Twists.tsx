import { Utils } from "@blueprintjs/core";
import Twist, { TwistElement, TwistId } from "@r2c/extension/content/Twist";
import * as classnames from "classnames";
import * as React from "react";
import { CSSTransition } from "react-transition-group";
import "./Twists.css";

interface TwistsProps {
  isOpen: boolean;
  selectedTwistId: TwistId | undefined;
}

export default class Twists extends React.Component<TwistsProps> {
  public render() {
    const { isOpen, selectedTwistId } = this.props;

    const twists = this.getTwistChildren()
      .filter(twist => twist.props.id === selectedTwistId)
      .map(this.renderTwist);

    return (
      <CSSTransition
        in={isOpen}
        classNames="twists-transition"
        timeout={300}
        mountOnEnter={true}
        unmountOnExit={true}
      >
        <div className="r2c-twists">{twists}</div>
      </CSSTransition>
    );
  }

  private renderTwist = (twist: TwistElement) => {
    const { className, panel, id } = twist.props;
    if (panel == null) {
      return undefined;
    }

    return (
      <div
        className={classnames("r2c-twist-panel", className)}
        aria-hidden={id !== this.props.selectedTwistId}
        key={id}
      >
        {panel}
      </div>
    );
  };

  private getTwistChildren = (
    props: TwistsProps & { children?: React.ReactNode } = this.props
  ) => {
    return React.Children.toArray(props.children).filter(child =>
      Utils.isElementOfType(child, Twist)
    ) as TwistElement[];
  };
}
