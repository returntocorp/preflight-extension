import { Popover, Position } from "@blueprintjs/core";
import { l } from "@r2c/extension/analytics";
import { FindingEntry } from "@r2c/extension/api/findings";
import FindingsGroupedList from "@r2c/extension/content/FindingsGroupedList";
import BlobMetadata from "@r2c/extension/content/github/BlobMetadata";
import DomElementLoadedWatcher from "@r2c/extension/content/github/DomElementLoadedWatcher";
import CommitWarningHeadsUp, {
  CommitChooser
} from "@r2c/extension/content/headsup/CommitWarningHeadsUp";
import { ExtractedRepoSlug } from "@r2c/extension/utils";
import * as classnames from "classnames";
import { groupBy } from "lodash";
import * as React from "react";
import "./BlobFindingsInjector.css";
import DOMInjector from "./DomInjector";

const ApproximateFindingNotice: React.SFC<BlobFindingsHighlighterProps> = ({
  repoSlug,
  findings,
  filePath
}) => (
  <div className="approximate-finding-notice">
    <header className="notice-title">Issue occurs in another commit</header>
    <span className="notice-text">Location may be approximate</span>
    <CommitChooser
      repoSlug={repoSlug}
      findings={findings}
      filePath={filePath}
      inlineFinding={true}
    />
  </div>
);

interface BlobFindingsInjectorProps {
  findings: FindingEntry[];
  findingCommitHash: string;
  repoSlug: ExtractedRepoSlug;
}

interface BlobFindingsHighlighterProps extends BlobFindingsInjectorProps {
  filePath: string;
  findingCommitHash: string;
  pageCommitHash: string | null;
  repoSlug: ExtractedRepoSlug;
}

interface BlobFindingDetailsProps {
  findings: FindingEntry[];
  repoSlug: ExtractedRepoSlug;
  findingCommitHash: string;
  pageCommitHash: string | null;
}

interface FindingSpan {
  height: number;
  top: number;
  bottom: number;
  leftMargin: number;
  leftGutter: number;
  rightMargin: number;
  startGutterElem: Element;
  startCodeElem: Element;
  endGutterElem: Element;
  endCodeElem: Element;
}

class BlobFindingHighlight extends React.PureComponent<
  BlobFindingDetailsProps
> {
  public render() {
    const { findings, repoSlug, findingCommitHash } = this.props;

    const findingSpan = this.computeFindingSpan(findings[0]);

    if (findingSpan == null || findingSpan.startGutterElem == null) {
      return null;
    }

    const findingCommitMatch =
      repoSlug.commitHash != null &&
      findings.every(finding => finding.commitHash === repoSlug.commitHash);

    const shouldOpenPopoverByDefault =
      repoSlug.startLineHash === findings[0].startLine;

    return (
      <DOMInjector
        destination={findingSpan.startGutterElem}
        childClassName="r2c-blob-finding-highlight-wrapper"
        injectedClassName="r2c-blob-finding-highlight"
        relation="direct"
      >
        <Popover
          className="r2c-blob-finding-highlight-wrapper"
          content={
            <>
              {!findingCommitMatch && (
                <ApproximateFindingNotice
                  findingCommitHash={findingCommitHash}
                  findings={findings}
                  repoSlug={repoSlug}
                  pageCommitHash={findingCommitHash}
                  filePath={findings[0].fileName}
                />
              )}
              <FindingsGroupedList
                commitHash={findingCommitHash}
                findings={findings}
                className="r2c-blob-findings-grouped-list"
                repoSlug={repoSlug}
              />
            </>
          }
          position={Position.LEFT_TOP}
          minimal={true}
          modifiers={{
            preventOverflow: { boundariesElement: "viewport" },
            offset: { offset: "0px,40px" }
          }}
          onOpened={l("blob-finding-highlight-click", undefined, {
            path: findings[0].fileName,
            startLine: findings[0].startLine
          })}
          defaultIsOpen={shouldOpenPopoverByDefault}
        >
          <div className="r2c-blob-finding-highlight-hitbox">
            <div
              className={classnames("finding-highlight-marker", {
                "marker-commit-match": findingCommitMatch,
                "marker-commit-mismatch": !findingCommitMatch,
                "marker-multiple-commits": findings.length > 1
              })}
            />
          </div>
        </Popover>
      </DOMInjector>
    );
  }

  private computeFindingSpan = (finding: FindingEntry): FindingSpan | null => {
    if (finding.startLine == null) {
      return null;
    }

    const startLineGutter = document.querySelector(
      buildLineNoElemIdForBlobLine(finding.startLine)
    );
    const endLineGutter = document.querySelector(
      buildLineNoElemIdForBlobLine(finding.endLine || finding.startLine)
    );
    const startLineCode = document.querySelector(
      buildCodeElemIdForBlobLine(finding.startLine)
    );
    const endLineCode = document.querySelector(
      buildCodeElemIdForBlobLine(finding.endLine || finding.startLine)
    );

    if (
      startLineGutter == null ||
      endLineGutter == null ||
      startLineCode == null ||
      endLineCode == null
    ) {
      return null;
    }

    const endLineBounds = endLineGutter.getBoundingClientRect();
    const startLineBounds = startLineGutter.getBoundingClientRect();
    const startCodeBounds = startLineCode.getBoundingClientRect();

    return {
      height: endLineBounds.bottom - startLineBounds.top,
      top: startLineBounds.top + window.scrollY,
      bottom: endLineBounds.bottom + window.scrollY,
      leftMargin: startLineBounds.left,
      leftGutter: startLineBounds.right,
      rightMargin: startCodeBounds.right,
      startCodeElem: startLineCode,
      startGutterElem: startLineGutter,
      endCodeElem: endLineCode,
      endGutterElem: endLineGutter
    };
  };
}

class BlobFindingsHighlighter extends React.PureComponent<
  BlobFindingsHighlighterProps
> {
  public render() {
    const filtered = this.props.findings.filter(
      finding => finding.fileName === this.props.filePath
    );

    const sortedByBlobSize = filtered.sort((a, b) =>
      compareFindingSizes(a, b, true)
    );

    if (sortedByBlobSize.length === 0) {
      return null;
    }

    const groupedByStartLine = groupBy(
      sortedByBlobSize,
      finding => finding.startLine
    );

    return Object.keys(groupedByStartLine).map((startLine, i) => (
      <BlobFindingHighlight
        key={i}
        findingCommitHash={this.props.findingCommitHash}
        pageCommitHash={this.props.pageCommitHash}
        findings={groupedByStartLine[startLine]}
        repoSlug={this.props.repoSlug}
      />
    ));
  }
}

export default class BlobFindingsInjector extends React.PureComponent<
  BlobFindingsInjectorProps
> {
  public render() {
    const { repoSlug, findingCommitHash } = this.props;

    return (
      <DomElementLoadedWatcher
        querySelector={[
          ".file .blob-wrapper .js-file-line-container",
          ".commit-tease-sha"
        ]}
      >
        {({ done }) => (
          <>
            {done && (
              <BlobMetadata repoSlug={repoSlug}>
                {({ filePath, commitHash }) => (
                  <>
                    <BlobFindingsHighlighter
                      filePath={filePath}
                      findingCommitHash={findingCommitHash}
                      pageCommitHash={commitHash}
                      findings={this.props.findings}
                      repoSlug={repoSlug}
                    />
                    <CommitWarningHeadsUp
                      repoSlug={repoSlug}
                      findings={this.props.findings}
                      currentCommitHash={commitHash}
                      filePath={filePath}
                    />
                  </>
                )}
              </BlobMetadata>
            )}
          </>
        )}
      </DomElementLoadedWatcher>
    );
  }
}

function getFindingSize(finding: FindingEntry): number {
  if (finding.endLine != null && finding.startLine != null) {
    return finding.endLine - finding.startLine;
  } else if (finding.startLine != null) {
    return 1;
  } else {
    return 0;
  }
}

function compareFindingSizes(
  a: FindingEntry,
  b: FindingEntry,
  desc?: boolean
): number {
  const aSize = getFindingSize(a);
  const bSize = getFindingSize(b);

  if (desc) {
    return bSize - aSize;
  } else {
    return aSize - bSize;
  }
}

function buildCodeElemIdForBlobLine(line: number): string {
  return `#LC${line}`;
}

export function buildLineNoElemIdForBlobLine(line: number): string {
  return `#L${line}`;
}
