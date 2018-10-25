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

    const isCurrentCommitByRepoSlug =
      commitHash != null && commitHash === repoSlug.commitHash;
    // Returns true for any page that has a commit tease sha element (e.g. GitHub project home, a file)
    const commitTeaseSha = this.getCommitTeaseSha();
    const isCurrentCommitByCommitTeaseSha =
      commitHash != null &&
      commitTeaseSha != null &&
      commitHash.startsWith(commitTeaseSha);

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
          {(isCurrentCommitByRepoSlug || isCurrentCommitByCommitTeaseSha) && (
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

  private getCommitTeaseSha(): string | null {
    const commitHashElement: HTMLElement | null = document.querySelector(
      "a.commit-tease-sha"
    );

    return commitHashElement != null ? commitHashElement.innerText : null;
  }
}
