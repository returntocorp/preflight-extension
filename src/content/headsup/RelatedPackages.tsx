import { Classes } from "@blueprintjs/core";
import { ApiFetch } from "@r2c/extension/api/fetch";
import {
  PackageResponse,
  RelatedPackagesResponse,
  relatedPackagesUrl
} from "@r2c/extension/api/package";
import * as classnames from "classnames";
import * as React from "react";

interface RelatedPackagesProps {
  pkg: PackageResponse;
}

export default class RelatedPackages extends React.PureComponent<
  RelatedPackagesProps
> {
  public render() {
    const { pkg } = this.props;

    return (
      <ApiFetch<RelatedPackagesResponse> url={relatedPackagesUrl()}>
        {({ loading, data }) => (
          <section className="related-packages">
            <header className={classnames({ [Classes.SKELETON]: loading })}>
              <h2>Project used with</h2>
            </header>
            <div
              className={classnames("related-packages-list", {
                [Classes.SKELETON]: loading
              })}
            />
          </section>
        )}
      </ApiFetch>
    );
  }
}
