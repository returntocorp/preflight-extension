import { Popover, Position } from "@blueprintjs/core";
import { l } from "@r2c/extension/analytics";
import { FindingEntry } from "@r2c/extension/api/findings";
import FindingsGroupedList from "@r2c/extension/content/FindingsGroupedList";
import BlobMetadata from "@r2c/extension/content/github/BlobMetadata";
import DomElementLoadedWatcher from "@r2c/extension/content/github/DomElementLoadedWatcher";
import { groupBy } from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import "./BlobFindingsInjector.css";

interface BlobFindingsInjectorProps {
  findings: FindingEntry[];
}

interface BlobFindingsHighlighterProps extends BlobFindingsInjectorProps {
  filePath: string;
  commitHash: string | null;
}

interface BlobFindingDetailsProps {
  findings: FindingEntry[];
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
    const { findings } = this.props;

    const findingSpan = this.computeFindingSpan(findings[0]);

    if (findingSpan == null || findingSpan.startGutterElem == null) {
      return null;
    }

    const destination = findingSpan.startGutterElem;
    const existingElem = destination.querySelector(
      ".r2c-blob-finding-highlight-wrapper"
    );

    if (existingElem != null) {
      existingElem.remove();
    }

    destination.classList.add("r2c-blob-finding-highlight");

    return ReactDOM.createPortal(
      <Popover
        className="r2c-blob-finding-highlight-wrapper"
        content={
          <FindingsGroupedList
            findings={findings}
            className="r2c-blob-findings-grouped-list"
          />
        }
        position={Position.LEFT_TOP}
        minimal={true}
        modifiers={{
          preventOverflow: { boundariesElement: "viewport" },
          offset: { offset: "0px 40px" }
        }}
        onOpened={l("blob-finding-highlight-click", undefined, {
          path: findings[0].fileName,
          startLine: findings[0].startLine
        })}
      >
        <div className="r2c-blob-finding-highlight-hitbox">
          <div className="finding-highlight-marker" />
        </div>
      </Popover>,
      destination
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
      <BlobFindingHighlight key={i} findings={groupedByStartLine[startLine]} />
    ));
  }
}

export default class BlobFindingsInjector extends React.Component<
  BlobFindingsInjectorProps
> {
  public render() {
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
              <BlobMetadata>
                {({ filePath, commitHash }) => (
                  <BlobFindingsHighlighter
                    filePath={filePath}
                    commitHash={commitHash}
                    findings={this.props.findings}
                  />
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

function buildLineNoElemIdForBlobLine(line: number): string {
  return `#L${line}`;
}
