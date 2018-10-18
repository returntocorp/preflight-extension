import { HeadsUpProps } from "@r2c/extension/content/headsup";
import {
  PreflightChecklist,
  PreflightChecklistFetchData
} from "@r2c/extension/content/headsup/PreflightChecklist";
import UsedBy from "@r2c/extension/content/headsup/UsedBy";
import LastUpdatedBadge from "@r2c/extension/content/LastUpdatedBadge";
import RepoPackageSection from "@r2c/extension/content/PackageCopyBox";
import { R2CLogo } from "@r2c/extension/icons";
import * as React from "react";
import "./index.css";

interface NormalHeadsUpProps extends HeadsUpProps {
  data: PreflightChecklistFetchData;
}

export default class NormalHeadsUp extends React.PureComponent<
  NormalHeadsUpProps
> {
  public render() {
    const { data } = this.props;

    return (
      <div className="r2c-repo-headsup checklist-headsup">
        <header>
          <div className="checklist-left">
            <span className="preflight-logo">preflight</span>
          </div>
          <div className="checklist-right">
            <LastUpdatedBadge
              commitHash={data.repo.commitHash}
              lastUpdatedDate={new Date(data.repo.analyzedAt)}
              repoSlug={this.props.repoSlug}
            />
            <R2CLogo />
          </div>
        </header>
        <div className="repo-headsup-body">
          <div className="repo-headsup-checklist">
            <PreflightChecklist
              {...data}
              onChecklistItemClick={this.props.onChecklistItemClick}
            />
          </div>
          <div className="repo-headsup-actions">
            <RepoPackageSection />
            {data.pkg && <UsedBy pkg={data.pkg} />}
          </div>
        </div>
      </div>
    );
  }
}
