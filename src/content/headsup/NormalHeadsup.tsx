import { PackageEntry } from "@r2c/extension/api/package";
import { HeadsUpProps } from "@r2c/extension/content/headsup";
import PackageCopyBox from "@r2c/extension/content/headsup/PackageCopyBox";
import { PreflightChecklist } from "@r2c/extension/content/headsup/PreflightChecklist";
import {
  PreflightChecklistFetchData,
  PreflightChecklistLoading
} from "@r2c/extension/content/headsup/PreflightFetch";
import RelatedPackages from "@r2c/extension/content/headsup/RelatedPackages";
import UsedBy from "@r2c/extension/content/headsup/UsedBy";
import LastUpdatedBadge from "@r2c/extension/content/LastUpdatedBadge";
import { R2CLogo } from "@r2c/extension/icons";
import * as React from "react";
import "./index.css";

interface NormalHeadsUpProps extends HeadsUpProps {
  data: PreflightChecklistFetchData;
  loading: PreflightChecklistLoading;
}

interface NormalHeadsUpState {
  selectedPackage: PackageEntry | undefined;
}

export default class NormalHeadsUp extends React.PureComponent<
  NormalHeadsUpProps,
  NormalHeadsUpState
> {
  public state: NormalHeadsUpState = {
    selectedPackage: undefined
  };

  public render() {
    const { data, loading } = this.props;
    const { selectedPackage } = this.state;

    return (
      <div className="r2c-repo-headsup checklist-headsup">
        <header>
          <div className="checklist-left">
            <span className="preflight-logo">preflight</span>
          </div>
          <div className="checklist-right">
            {data.repo != null && (
              <LastUpdatedBadge
                commitHash={data.repo.commitHash}
                lastUpdatedDate={new Date(data.repo.analyzedAt)}
                repoSlug={this.props.repoSlug}
              />
            )}
            <R2CLogo />
          </div>
        </header>
        <div className="repo-headsup-body">
          <div className="repo-headsup-checklist repo-headsup-column">
            <PreflightChecklist
              data={data}
              loading={loading}
              onChecklistItemClick={this.props.onChecklistItemClick}
            />
          </div>
          {data.pkg &&
            selectedPackage && (
              <div className="repo-headsup-supplemental repo-headsup-column">
                <UsedBy pkg={data.pkg} selectedPackage={selectedPackage} />
                <RelatedPackages selectedPackage={selectedPackage} />
              </div>
            )}
          <div className="repo-headsup-actions repo-headsup-column">
            <PackageCopyBox
              packages={data.pkg}
              onSelectPackage={this.handlePackageSelect}
            />
          </div>
        </div>
      </div>
    );
  }

  private handlePackageSelect = (newPackage: PackageEntry) => {
    this.setState({ selectedPackage: newPackage });
  };
}
