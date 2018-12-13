import { IconNames } from "@blueprintjs/icons";
import { li } from "@r2c/extension/analytics";
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
import { MainToaster } from "@r2c/extension/content/Toaster";
import { R2CLogoLink } from "@r2c/extension/icons";
import * as classNames from "classnames";
import * as React from "react";
import "./index.css";

export class ReportMistakeActionButton extends React.PureComponent {
  public render() {
    return (
      <div className="repo-headsup-report">
        See any problems?{" "}
        <a
          onClick={this.handleReportClick}
          href="https://github.com/returntocorp/preflight-extension/issues/new?template=report-bad-data.md"
          target="_blank"
          rel="noopener noreferrer"
          role="button"
        >
          Let us know.
        </a>
      </div>
    );
  }

  private handleReportClick: React.MouseEventHandler = () => {
    li("preflight-report-mistake-click");
    MainToaster.show({
      message:
        "Thanks for letting us know. We'll take a look and make it right.",
      icon: IconNames.HEART
    });
  };
}

interface DetailedHeadsupProps extends HeadsUpProps {
  data: PreflightChecklistFetchData;
  loading: PreflightChecklistLoading;
}

interface DetailedHeadsupState {
  selectedPackage: PackageEntry | undefined;
}

export default class DetailedHeadsup extends React.PureComponent<
  DetailedHeadsupProps,
  DetailedHeadsupState
> {
  public state: DetailedHeadsupState = {
    selectedPackage: undefined
  };

  public render() {
    const { data, loading, repoSlug, onChecklistItemClick } = this.props;
    const { selectedPackage } = this.state;

    return (
      <div
        className={classNames(
          "r2c-repo-headsup",
          "checklist-headsup",
          "detailed-headsup"
        )}
      >
        <div className="repo-headsup-body">
          <div className="repo-headsup-checklist repo-headsup-column">
            <PreflightChecklist
              repoSlug={repoSlug}
              data={data}
              loading={loading}
              onChecklistItemClick={onChecklistItemClick}
            />
          </div>
          {data.pkg &&
            selectedPackage && (
              <div className="repo-headsup-supplemental repo-headsup-column">
                <UsedBy
                  pkg={data.pkg}
                  selectedPackage={selectedPackage}
                  loading={loading.pkg}
                />
                <RelatedPackages
                  repoSlug={repoSlug}
                  selectedPackage={selectedPackage}
                />
              </div>
            )}
          <div className="repo-headsup-actions repo-headsup-column">
            <PackageCopyBox
              packages={data.pkg}
              onSelectPackage={this.handlePackageSelect}
              loading={loading.pkg}
            />
            <div className="repo-headsup-actions-footer">
              <ReportMistakeActionButton />
              <R2CLogoLink />
            </div>
          </div>
        </div>
      </div>
    );
  }

  private handlePackageSelect = (newPackage: PackageEntry) => {
    this.setState({ selectedPackage: newPackage });
  };
}
