import {
  AnchorButton,
  Button,
  Intent,
  MenuItem,
  Position
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { ItemRenderer, Select } from "@blueprintjs/select";
import { l } from "@r2c/extension/analytics";
import { FindingEntry } from "@r2c/extension/api/findings";
import DOMInjector from "@r2c/extension/content/github/DomInjector";
import { buildFindingFileLink, ExtractedRepoSlug } from "@r2c/extension/utils";
import { groupBy } from "lodash";
import * as React from "react";
import "./CommitWarningHeadsUp.css";

interface CommitWarningHeadsUpProps {
  repoSlug: ExtractedRepoSlug;
  findings: FindingEntry[];
  currentCommitHash: string | null;
  filePath: string;
  debug?: boolean;
}

interface CommitFindingGroup {
  commitHash: string;
  numFindings: number;
}

const CommitSelect = Select.ofType<CommitFindingGroup>();

interface CommitChooserProps {
  repoSlug: ExtractedRepoSlug;
  filePath: string;
  findings: FindingEntry[];
}

export class CommitChooser extends React.PureComponent<CommitChooserProps> {
  public render() {
    const { findings, repoSlug, filePath } = this.props;

    const commitHashList = groupBy(
      findings,
      (finding: FindingEntry) => finding.commitHash
    );
    const commitGroups: CommitFindingGroup[] = Object.keys(commitHashList).map(
      key => ({ commitHash: key, numFindings: commitHashList[key].length })
    );

    if (commitGroups.length === 1) {
      return (
        <AnchorButton
          href={buildFindingFileLink(
            repoSlug,
            commitGroups[0].commitHash,
            filePath,
            null
          )}
          intent={Intent.SUCCESS}
          onClick={l("commit-warning-action-click")}
        >
          Go to past commit
        </AnchorButton>
      );
    } else if (commitGroups.length > 1) {
      return (
        <CommitSelect
          items={commitGroups}
          itemRenderer={this.renderCommitHashEntry}
          onItemSelect={this.handleCommitHashSelect}
          popoverProps={{
            position: Position.BOTTOM_LEFT,
            minimal: true,
            popoverClassName: "commit-hash-select-menu",
            className: "commit-hash-select-dropdown-wrapper",
            targetClassName: "commit-hash-select-dropdown-target"
          }}
          filterable={false}
        >
          <Button
            className="commit-hash-select-dropdown-button"
            rightIcon={IconNames.CARET_DOWN}
            text="Go to past commit..."
            intent={Intent.SUCCESS}
          />
        </CommitSelect>
      );
    }

    return null;
  }

  private renderCommitHashEntry: ItemRenderer<CommitFindingGroup> = (
    group,
    { handleClick, modifiers, query }
  ) => (
    <MenuItem
      className="commit-hash-entry"
      active={modifiers.active}
      disabled={modifiers.disabled}
      label={`${group.numFindings} findings`}
      key={group.commitHash}
      onClick={handleClick}
      text={group.commitHash.slice(0, 8)}
    />
  );

  private handleCommitHashSelect = (commitHashGroup: CommitFindingGroup) => {
    const { repoSlug, filePath } = this.props;

    window.location.href = buildFindingFileLink(
      repoSlug,
      commitHashGroup.commitHash,
      filePath,
      null
    );
  };
}

export default class CommitWarningHeadsUp extends React.PureComponent<
  CommitWarningHeadsUpProps
> {
  public render() {
    return (
      <DOMInjector
        destination=".file-navigation"
        childClassName="r2c-repo-headsup-container"
        relation="before"
      >
        {this.renderInjected()}
      </DOMInjector>
    );
  }

  private renderInjected() {
    const { repoSlug, filePath, findings, debug } = this.props;
    const commitHashes = new Set(findings
      .map(finding => finding.commitHash)
      .filter(f => f) as string[]);

    if (findings.length === 0) {
      return (
        debug && (
          <div className="r2c-repo-headsup commit-warning-headsup">
            DEBUG: No findings for the current file
          </div>
        )
      );
    }

    if (commitHashes.size === 0) {
      return (
        debug && (
          <div className="r2c-repo-headsup commit-warning-headsup">
            DEBUG: No findings with commit hashes
          </div>
        )
      );
    }

    if (
      repoSlug.seemsLikeCommitHash &&
      repoSlug.commitHash != null &&
      commitHashes.has(repoSlug.commitHash) &&
      commitHashes.size === 1
    ) {
      return (
        debug && (
          <div className="r2c-repo-headsup commit-warning-headsup">
            DEBUG: Commit hash matches all known findings
          </div>
        )
      );
    }

    return (
      <div className="r2c-repo-headsup commit-warning-headsup">
        <div className="headsup-inline-message">
          <span className="headsup-different-commit">
            We're showing issues that we found in past commits, so markers may
            not be exact. Go to past commits for exact issue locations.
          </span>
          <CommitChooser
            filePath={filePath}
            findings={findings}
            repoSlug={repoSlug}
          />
        </div>
      </div>
    );
  }
}
