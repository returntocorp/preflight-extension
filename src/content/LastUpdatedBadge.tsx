import { Popover, Position } from "@blueprintjs/core";
import {
  buildGitHubTreeCommitUrl,
  ExtractedRepoSlug
} from "@r2c/extension/utils";
import * as React from "react";
import TimeAgo from "react-timeago";
import "./LastUpdatedBadge.css";

interface LastUpdatedBadgeProps {
  repoSlug: ExtractedRepoSlug;
  commitHash?: string;
  lastUpdatedDate: Date;
}

export default class LastUpdatedBadge extends React.PureComponent<
  LastUpdatedBadgeProps
> {
  public render() {
    const { repoSlug, commitHash, lastUpdatedDate } = this.props;

    return (
      <Popover
        content={
          <div className="r2c-updated-commit-popover">
            Code analyzed at{" "}
            {commitHash != null && (
              <a href={buildGitHubTreeCommitUrl(repoSlug, commitHash)}>
                {commitHash.substring(0, 7)}
              </a>
            )}
          </div>
        }
        disabled={commitHash == null}
        position={Position.BOTTOM}
      >
        <span className="r2c-last-updated-badge">
          {commitHash != null &&
            commitHash === repoSlug.commitHash && (
              <div className="current-commit">Current commit</div>
            )}
          <span className="updated-message">
            Code scanned{" "}
            <span className="updated-timeago">
              <TimeAgo date={lastUpdatedDate} />
            </span>
          </span>
        </span>
      </Popover>
    );
  }
}
