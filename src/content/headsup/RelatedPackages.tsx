import { Classes, Icon } from "@blueprintjs/core";
import { ApiFetch } from "@r2c/extension/api/fetch";
import {
  PackageEntry,
  RelatedPackageEntry,
  RelatedPackagesResponse,
  relatedPackagesUrl
} from "@r2c/extension/api/package";
import { buildPackageLink } from "@r2c/extension/utils";
import * as classnames from "classnames";
import * as React from "react";
import "./RelatedPackages.css";

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

interface RelatedPackagesListProps {
  relatedPackages: RelatedPackageEntry[];
}

class RelatedPackagesList extends React.PureComponent<
  RelatedPackagesListProps
> {
  public render() {
    const { relatedPackages } = this.props;

    return (
      <span className="related-packages-list">
        {relatedPackages.slice(0, 3).map(entry => (
          <span key={entry.related} className="related-packages-link-wrapper">
            <PackageLink to={entry.related} />,{" "}
          </span>
        ))}
        {relatedPackages.length > 3 && (
          <span className="related-packages-more">
            and {relatedPackages.length - 3} more
          </span>
        )}
      </span>
    );
  }
}

interface RelatedPackagesProps {
  selectedPackage: PackageEntry;
}

export default class RelatedPackages extends React.PureComponent<
  RelatedPackagesProps
> {
  public render() {
    const { selectedPackage } = this.props;

    return (
      <ApiFetch<RelatedPackagesResponse> url={relatedPackagesUrl()}>
        {({ loading, data, error }) => (
          <section className="related-packages-container">
            <header className={classnames({ [Classes.SKELETON]: loading })}>
              <h2>Project used with</h2>
            </header>
            <div
              className={classnames("related-packages-list", {
                [Classes.SKELETON]: loading
              })}
            >
              {data != null && data.related[selectedPackage.name] != null ? (
                <RelatedPackagesList
                  relatedPackages={data.related[selectedPackage.name]}
                />
              ) : (
                <div className="nonideal-inline">
                  <Icon icon="heart-broken" /> No related packages
                </div>
              )}
            </div>
          </section>
        )}
      </ApiFetch>
    );
  }
}
