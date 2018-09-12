import * as classnames from "classnames";
import * as React from "react";

interface R2CLogoProps {
  className?: string;
  fill?: string;
}

export const R2CLogo: React.SFC<R2CLogoProps> = ({
  className,
  fill = "white"
}) => (
  <svg
    width="134"
    height="174"
    viewBox="0 0 134 174"
    fill="none"
    className={classnames("r2c-logo", className)}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      className="r2c-logo-path"
      d="M32.7444 0L0 33.0664L32.7444 66.1328L44.6218 54.1384L23.7549 33.0664L44.6218 11.9944L32.7444 0ZM134 174L44.3364 111.69H82.0891C106.243 111.69 126.71 91.5894 126.71 66.6414C126.71 42.0725 108.292 21.5928 82.0891 21.5928H50.8916L39.8159 32.7773L50.8916 43.9617H82.0891C95.4746 43.9617 104.536 53.8428 104.536 66.6414C104.536 79.0847 94.1465 89.321 82.0891 89.321H1.25049V110.335L94.4165 174H134Z"
      fill={fill}
    />
  </svg>
);
