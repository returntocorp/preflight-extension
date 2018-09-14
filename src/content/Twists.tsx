import { Utils } from "@blueprintjs/core";
import ActionButton, {
  ActionButtonElement
} from "@r2c/extension/content/ActionButton";
import Twist, { TwistElement, TwistId } from "@r2c/extension/content/Twist";
import * as classnames from "classnames";
import * as React from "react";
import { CSSTransition } from "react-transition-group";
import "./Twists.css";

interface TwistsProps {
  isOpen: boolean;
  selectedTwistId: TwistId | undefined;
  onTwistChange?(twistId: TwistId, event: React.MouseEvent<HTMLElement>): void;
}

export default class Twists extends React.PureComponent<TwistsProps> {
  public render() {
    const { isOpen, selectedTwistId } = this.props;

    const twistChildren = this.getTwistChildren();

    const actions = this.renderActions();

    const twistToRender = twistChildren
      .filter(twist => twist.props.id === selectedTwistId)
      .map(this.renderTwist);

    return (
      <div className="r2c-actionbar">
        <div className="actionbar-actions">{actions}</div>
        {twistToRender != null && (
          <CSSTransition
            in={isOpen}
            classNames="twists-transition"
            timeout={300}
            mountOnEnter={true}
            unmountOnExit={true}
          >
            <div className="twist-container">{twistToRender}</div>
          </CSSTransition>
        )}
      </div>
    );
  }

  private renderTwist = (twist: TwistElement) => {
    const { className, panel, id } = twist.props;
    if (panel == null) {
      return null;
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

  private renderActions = (
    props: TwistsProps & { children?: React.ReactNode } = this.props
  ): ActionButtonElement[] => {
    const children = React.Children.toArray(props.children).filter(
      child =>
        Utils.isElementOfType(child, Twist) ||
        Utils.isElementOfType(child, ActionButton)
    ) as (TwistElement | ActionButtonElement)[];

    return children.map(child => {
      if (Utils.isElementOfType(child, ActionButton)) {
        return child;
      } else {
        return (
          <ActionButton
            id={child.props.id}
            title={child.props.title}
            key={child.props.id}
            icon={child.props.icon}
            count={child.props.count}
            selected={this.props.selectedTwistId === child.props.id}
            tooltipContent={child.props.tooltipContent}
            onClick={this.handleTwistChange}
          />
        );
      }
    });
  };

  private handleTwistChange = (
    twistId: TwistId,
    e: React.MouseEvent<HTMLElement>
  ) => {
    Utils.safeInvoke(this.props.onTwistChange, twistId, e);
  };
}
