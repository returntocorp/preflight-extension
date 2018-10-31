import { Classes, Intent } from "@blueprintjs/core";
import { ApiFetch } from "@r2c/extension/api/fetch";
import {
  PackageEntry,
  RelatedPackageEntry,
  RelatedPackagesResponse,
  relatedPackagesUrl
} from "@r2c/extension/api/package";
import NonIdealInline from "@r2c/extension/content/NonIdealInline";
import PluralizedList from "@r2c/extension/content/PluralizedList";
import * as React from "react";
import "./RelatedPackages.css";

interface RelatedPackagesListProps {
  relatedPackages: RelatedPackageEntry[] | undefined;
}

export class RelatedPackagesList extends React.PureComponent<
  RelatedPackagesListProps
> {
  public render() {
    const { relatedPackages } = this.props;

    if (relatedPackages == null) {
      return null;
    } else {
      return (
        <PluralizedList items={relatedPackages}>
          {item => (
            <a href={item.sourceUrl} rel="noreferer noopener">
              {item.related}
            </a>
          )}
        </PluralizedList>
      );
    }
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
        {({ loading, data, error }) => {
          if (loading) {
            return (
              <NonIdealInline
                icon="heart"
                message="Loading..."
                className={Classes.SKELETON}
              />
            );
          } else if (data != null && Object.keys(data.related).length > 0) {
            if (data.related[selectedPackage.name] != null) {
              return (
                <section className="related-packages-container">
                  <header>
                    <h2>
                      <span className="related-packages-package selected-package">
                        {selectedPackage.name}
                      </span>{" "}
                      used with
                    </h2>
                  </header>
                  <div className="related-packages-list">
                    <RelatedPackagesList
                      relatedPackages={data.related[selectedPackage.name]}
                    />
                  </div>
                </section>
              );
            } else {
              // No related packages for the currently selected package, but
              // other packages of this project have related packages
              return (
                <NonIdealInline
                  icon="heart-broken"
                  className="related-package-nonideal headsup-supplemental-nonideal"
                  message={`No related packages for ${
                    selectedPackage.name
                  }, but other
                  packages have related packages.`}
                  muted={true}
                />
              );
            }
          } else if (error) {
            return (
              <NonIdealInline
                icon="offline"
                className="related-package-nonideal headsup-supplemental-nonideal"
                intent={Intent.DANGER}
                message="Couldn't fetch related packages"
              />
            );
          } else {
            // Doesn't seem like we have any related packages for this project
            return (
              <NonIdealInline
                icon="heart-broken"
                className="related-package-nonideal headsup-supplemental-nonideal"
                message={`No related packages for ${selectedPackage.name}`}
                muted={true}
              />
            );
          }
        }}
      </ApiFetch>
    );
  }
}
