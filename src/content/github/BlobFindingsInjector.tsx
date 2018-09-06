import { FindingEntry } from "@r2c/extension/api/findings";
import BlobMetadata from "@r2c/extension/content/github/BlobMetadata";
import * as React from "react";
import "./BlobFindingsInjector.css";

interface BlobFindingsInjectorProps {
  findings: FindingEntry[];
}

interface BlobFindingsHighlighterProps extends BlobFindingsInjectorProps {
  filePath: string;
  commitHash: string;
}

interface BlobFindingDetailsProps {
  finding: FindingEntry;
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

// const BlobFindingDetails: React.SFC<BlobFindingDetailsProps> = ({
//   finding
// }) => (
//   <article className="blob-finding-details">
//     <header>
//       <h1>{finding.analyzerName}</h1>
//       <h2>
//         {finding.fileName}:{finding.startLine}
//         {finding.endLine != null ? `-${finding.endLine}` : ""}
//       </h2>
//     </header>
//   </article>
// );

class BlobFindingHighlight extends React.PureComponent<
  BlobFindingDetailsProps
> {
  public render() {
    const findingSpan = this.computeFindingSpan();

    if (findingSpan == null) {
      return null;
    }

    findingSpan.startGutterElem.classList.add("r2c-finding-start");

    return null;
  }

  private computeFindingSpan = (): FindingSpan | null => {
    const { finding } = this.props;

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
      console.warn("No findings found");

      return null;
    }

    return sortedByBlobSize.map((finding, i) => (
      <BlobFindingHighlight key={i} finding={finding} />
    ));
  }

  // private computePackOrder = (findings: FindingEntry[]): number[] => {
  //   const packing: number[] = [];

  //   findings.forEach((finding, findingIndex) => {
  //     if (finding.startLine == null) {
  //       return;
  //     }

  //     // _.range is non-inclusive, so end must be at least 1 higher than start
  //     const endLine = finding.endLine || finding.startLine + 1;

  //     range(finding.startLine, endLine).forEach(line => {});
  //   });
  // };
}

export default class BlobFindingsInjector extends React.Component<
  BlobFindingsInjectorProps
> {
  public render() {
    return (
      <BlobMetadata>
        {({ filePath, commitHash }) => (
          <>
            <BlobFindingsHighlighter
              filePath={filePath}
              commitHash={commitHash}
              findings={this.props.findings}
            />
          </>
        )}
      </BlobMetadata>
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

function compareFindingSizes(a: FindingEntry, b: FindingEntry, desc?: boolean) {
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

// let rrColorIndex = 0;
// const roundRobinColors = [
//   // taken from https://blueprintjs.com/docs/#core/colors
//   "#D13913" // vermillion3
// ];

// function getNextColor(): string {
//   // tslint:disable-next-line:no-increment-decrement
//   return roundRobinColors[rrColorIndex++ % roundRobinColors.length];
// }
