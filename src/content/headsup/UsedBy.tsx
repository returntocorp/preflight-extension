import { Classes } from "@blueprintjs/core";
import { PackageEntry, PackageResponse } from "@r2c/extension/api/package";
import NonIdealInline from "@r2c/extension/content/NonIdealInline";
import ProfilePicture from "@r2c/extension/shared/ProfilePicture";
import * as classnames from "classnames";
import * as React from "react";
import "./UsedBy.css";

interface UsedByProps {
  pkg: PackageResponse;
  loading: boolean | null;
  selectedPackage: PackageEntry;
}

export default class UsedBy extends React.PureComponent<UsedByProps> {
  public render() {
    const { selectedPackage, loading } = this.props;
    const selectedEndorsers = selectedPackage.endorsers;

    if (loading) {
      return (
        <NonIdealInline
          icon="airplane"
          className={classnames("related-package-nonideal", Classes.SKELETON)}
          message="Loading..."
        />
      );
    } else if (selectedEndorsers.length === 0) {
      return (
        <NonIdealInline
          icon="blocked-person"
          className="related-package-nonideal headsup-supplemental-nonideal"
          message={`No prominent orgs use ${selectedPackage.name} publicly`}
          muted={true}
        />
      );
    } else {
      return (
        <section className="used-by-container">
          <header>
            <h2>
              <span className="used-by-package selected-package">
                {selectedPackage.name}
              </span>{" "}
              used by
            </h2>
          </header>
          <div className="used-by-list">
            {selectedEndorsers.map(endorser => (
              <ProfilePicture
                key={endorser}
                user={endorser}
                className="used-by-endorser"
                showTooltip={true}
                linkToUser={true}
              />
            ))}
          </div>
        </section>
      );
    }
  }
}
