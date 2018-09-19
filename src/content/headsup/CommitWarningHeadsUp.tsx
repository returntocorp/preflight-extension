import {
  AnchorButton,
  Button,
  Intent,
  MenuItem,
  Position
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { ItemRenderer, Select } from "@blueprintjs/select";
import { FindingEntry } from "@r2c/extension/api/findings";
import DOMInjector from "@r2c/extension/content/github/DomInjector";
import { buildFindingFileLink, ExtractedRepoSlug } from "@r2c/extension/utils";
import * as React from "react";
import "./CommitWarningHeadsUp.css";

interface CommitWarningHeadsUpProps {
  repoSlug: ExtractedRepoSlug;
  findings: FindingEntry[];
  currentCommitHash: string | null;
  filePath: string;
}

const CommitSelect = Select.ofType<string>();

export default class CommitWarningHeadsUp extends React.PureComponent<
  CommitWarningHeadsUpProps
> {
  public render() {
    return (
      <DOMInjector
        destinationClassName="file-navigation"
        injectedClassName="r2c-repo-headsup-container"
        position="before"
      >
        {this.renderInjected()}
      </DOMInjector>
    );
  }

  private renderInjected() {
    const { repoSlug, filePath, findings } = this.props;
    const commitHashes = new Set(findings
      .map(finding => finding.commitHash)
      .filter(f => f) as string[]);

    if (findings.length === 0) {
      return (
        <div className="r2c-repo-headsup commit-warning-headsup">
          DEBUG: No findings for the current file
        </div>
      );
    }

    if (commitHashes.size === 0) {
      return (
        <div className="r2c-repo-headsup commit-warning-headsup">
          DEBUG: No findings with commit hashes
        </div>
      );
    }

    if (
      repoSlug.seemsLikeCommitHash &&
      repoSlug.commitHash != null &&
      commitHashes.has(repoSlug.commitHash) &&
      commitHashes.size === 1
    ) {
      return (
        <div className="r2c-repo-headsup commit-warning-headsup">
          DEBUG: Commit hash matches all known findings
        </div>
      );
    }

    const commitHashList = Array.from(commitHashes);

    return (
      <div className="r2c-repo-headsup commit-warning-headsup">
        <div className="headsup-inline-message">
          <span className="headsup-different-commit">
            We're also showing you issues that we found in past commits.
          </span>
          {commitHashList.length === 1 && (
            <AnchorButton
              href={buildFindingFileLink(
                repoSlug,
                commitHashList[0],
                filePath,
                null
              )}
              intent={Intent.SUCCESS}
            >
              Go to past commit
            </AnchorButton>
          )}
          {commitHashList.length > 1 && (
            <CommitSelect
              items={commitHashList}
              itemRenderer={this.renderCommitHashEntry}
              onItemSelect={this.handleCommitHashSelect}
              popoverProps={{
                position: Position.BOTTOM_LEFT,
                minimal: true,
                popoverClassName: "commit-hash-select-menu",
                className: "commit-hash-select-dropdown-wrapper",
                targetClassName: "commit-hash-select-dropdown-target"
              }}
            >
              <Button
                className="commit-hash-select-dropdown-button"
                rightIcon={IconNames.CARET_DOWN}
                minimal={true}
                text="Choose another..."
                intent={Intent.PRIMARY}
              />
            </CommitSelect>
          )}
        </div>
      </div>
    );
  }

  private renderCommitHashEntry: ItemRenderer<string> = (
    commitHash,
    { handleClick, modifiers, query }
  ) => (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      key={commitHash}
      onClick={handleClick}
      text={commitHash}
    />
  );

  private handleCommitHashSelect = (commitHash: string) => {
    const { repoSlug, filePath } = this.props;

    window.location.href = buildFindingFileLink(
      repoSlug,
      commitHash,
      filePath,
      null
    );
  };
}
