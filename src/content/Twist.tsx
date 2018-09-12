import * as classnames from "classnames";
import * as React from "react";
import "./Twist.css";

export type TwistId = string;
export type TwistElement = React.ReactElement<
  TwistProps & { children: React.ReactNode }
>;

interface TwistProps {
  id: TwistId;
  title: string;
  icon: React.ReactNode;
  panel?: JSX.Element;
  count?: number;
  className?: string;
  tooltipContent?: JSX.Element;
}

const Twist: React.SFC<TwistProps> = ({ className, panel }) => {
  // Not used

  return (
    <div className={classnames("r2c-twist-panel", className)}>{panel}</div>
  );
};

export default Twist;
