import { buildPackageLink } from "@r2c/extension/utils";
import * as classnames from "classnames";
import * as React from "react";

interface PackageLinkProps {
  to: string;
  className?: string;
}

const PackageLink: React.SFC<PackageLinkProps> = ({ to, className }) => (
  <a
    href={buildPackageLink(to)}
    rel="noopener noreferer"
    className={classnames("package-link", className)}
  >
    {to}
  </a>
);

export default PackageLink;
