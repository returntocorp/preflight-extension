import { PackageResponse } from "@r2c/extension/api/package";
import ProfilePicture from "@r2c/extension/shared/ProfilePicture";
import * as React from "react";
import "./UsedBy.css";

interface UsedByProps {
  pkg: PackageResponse;
}

export default class UsedBy extends React.PureComponent<UsedByProps> {
  public render() {
    const { pkg } = this.props;
    const endorsers = pkg.packages
      .map(entry => entry.endorsers)
      .reduce((prev, cur) => Array.from(new Set([...prev, ...cur])));

    return (
      <div className="used-by-container">
        {endorsers.length > 0 && (
          <header>
            <h2>All packages used by</h2>
          </header>
        )}
        <div className="used-by-list">
          {endorsers.map(endorser => (
            <ProfilePicture
              key={endorser}
              user={endorser}
              className="used-by-endorser"
            />
          ))}
        </div>
      </div>
    );
  }
}
