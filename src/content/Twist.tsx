import * as classnames from "classnames";
import * as React from "react";
import "./Twist.css";

export type TwistId = string;
export type TwistElement = React.ReactElement<
  TwistProps & { children: React.ReactNode }
>;

interface TwistProps {
  id: TwistId;
  panel?: JSX.Element;
  className?: string;
}

const Twist: React.SFC<TwistProps> = ({ className, panel }) => {
  return (
    <div className={classnames("r2c-twist-panel", className)}>{panel}</div>
  );
};

export default Twist;
