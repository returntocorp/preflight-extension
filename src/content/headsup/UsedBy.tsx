import { PackageResponse } from "@r2c/extension/api/package";
import ProfilePicture from "@r2c/extension/shared/ProfilePicture";
import { flatten, uniq } from "lodash";
import * as React from "react";
import "./UsedBy.css";

interface UsedByProps {
  pkg: PackageResponse | undefined;
}

export default class UsedBy extends React.PureComponent<UsedByProps> {
  public render() {
    const { pkg } = this.props;
    if (pkg == null) {
      return null;
    }

    const endorsers = flatten(pkg.packages.map(entry => entry.endorsers));
    if (endorsers.length === 0) {
      return null;
    }

    const uniqueEndorsers = uniq(endorsers);
    if (uniqueEndorsers.length === 0) {
      return null;
    }

    return (
      <div className="used-by-container">
        <header>
          <h2>Packages used by</h2>
        </header>
        <div className="used-by-list">
          {uniqueEndorsers.map(endorser => (
            <ProfilePicture
              key={endorser}
              user={endorser}
              className="used-by-endorser"
              showTooltip={true}
              linkToUser={true}
            />
          ))}
        </div>
      </div>
    );
  }
}
