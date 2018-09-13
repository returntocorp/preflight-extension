import { Tooltip } from "@blueprintjs/core";
import { l } from "@r2c/extension/analytics";
import { TwistId } from "@r2c/extension/content/Twist";
import * as classnames from "classnames";
import * as React from "react";

interface ActionButtonCountProps {
  count: number | undefined;
}

const ActionButtonCount: React.SFC<ActionButtonCountProps> = ({ count }) =>
  count != null ? (
    <span className="action-count-container">
      <div className="action-count">{count}</div>
    </span>
  ) : null;

interface ActionButtonProps {
  id: TwistId;
  title: string;
  icon: React.ReactNode;
  selected?: boolean;
  count?: number;
  tooltipContent?: JSX.Element;
  onClick(id: TwistId, event: React.MouseEvent<HTMLElement>): void;
}

export type ActionButtonElement = React.ReactElement<
  ActionButtonProps & { children: React.ReactNode }
>;

export default class ActionButton extends React.PureComponent<
  ActionButtonProps
> {
  public render() {
    const { id, title, icon, selected, count, tooltipContent } = this.props;

    const button = (
      <div
        className={classnames("r2c-action-button", `${id}-action-button`, {
          "action-button-selected": selected
        })}
      >
        <ActionButtonCount count={count} />
        <a
          className="action-button-link"
          title={title}
          role="button"
          onClick={l(`${id}-action-button-click`, this.handleActionClick)}
        >
          {icon}
        </a>
      </div>
    );

    if (tooltipContent) {
      return <Tooltip content={tooltipContent}>{button}</Tooltip>;
    } else {
      return button;
    }
  }

  private handleActionClick: React.MouseEventHandler<HTMLElement> = e =>
    this.props.onClick(this.props.id, e);
}
