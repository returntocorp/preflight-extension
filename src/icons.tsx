import * as classnames from "classnames";
import * as React from "react";

interface R2CLogoProps {
  className?: string;
  width?: string;
  fill?: string;
}

export const R2CLogo: React.SFC<R2CLogoProps> = ({
  className,
  width,
  fill = "white"
}) => (
  <svg
    width={width != null ? width : "134"}
    height={width != null ? undefined : "174"}
    viewBox="0 0 134 174"
    fill="transparent"
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

export const QuestionMark: React.SFC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M14.601 21.5c0 1.38-1.116 2.5-2.499 2.5-1.378 0-2.499-1.12-2.499-2.5s1.121-2.5 2.499-2.5c1.383 0 2.499 1.119 2.499 2.5zm-2.42-21.5c-4.029 0-7.06 2.693-7.06 8h3.955c0-2.304.906-4.189 3.024-4.189 1.247 0 2.57.828 2.684 2.411.123 1.666-.767 2.511-1.892 3.582-2.924 2.78-2.816 4.049-2.816 7.196h3.943c0-1.452-.157-2.508 1.838-4.659 1.331-1.436 2.986-3.222 3.021-5.943.047-3.963-2.751-6.398-6.697-6.398z" />
  </svg>
);
