import { AnchorButton, Classes } from "@blueprintjs/core";
import { FindingEntry } from "@r2c/extension/api/findings";
import { buildFindingFileLink, ExtractedRepoSlug } from "@r2c/extension/utils";
import * as classnames from "classnames";
import { groupBy, mapValues, sortBy } from "lodash";
import * as React from "react";
import "./FindingsGroupedList.css";

interface FindingsGroupedListProps {
  findings: FindingEntry[];
  commitHash: string;
  repoSlug?: ExtractedRepoSlug;
  className?: string;
}

interface FindingsGroupProps {
  fileName: string;
  commitHash: string;
  findings: FindingEntry[];
  repoSlug?: ExtractedRepoSlug;
}

class FindingsGroup extends React.PureComponent<FindingsGroupProps> {
  public render() {
    const { repoSlug, commitHash, fileName } = this.props;

    return (
      <section className="findings-group">
        <header>
          {repoSlug != null ? (
            <a
              href={buildFindingFileLink(repoSlug, commitHash, fileName, null)}
            >
              {this.props.fileName}
            </a>
          ) : (
            this.props.fileName
          )}
        </header>
        <div className="findings-group-entries">
          {this.props.findings.map((finding, i) => (
            <AnchorButton
              minimal={true}
              key={`${finding.fileName} ${finding.startLine} ${
                finding.analyzerName
              } ${finding.checkId} ${i}`}
              className={classnames({ [Classes.DISABLED]: repoSlug == null })}
              fill={true}
              href={
                repoSlug != null
                  ? buildFindingFileLink(
                      repoSlug,
                      finding.commitHash,
                      fileName,
                      finding.startLine,
                      finding.endLine
                    )
                  : undefined
              }
            >
              <div className="finding-entry">
                <span className="finding-entry-startline">
                  {finding.startLine}
                </span>
                <span className="finding-entry-checkid">{finding.checkId}</span>
              </div>
            </AnchorButton>
          ))}
        </div>
      </section>
    );
  }
}

export default class FindingsGroupedList extends React.PureComponent<
  FindingsGroupedListProps
> {
  public render() {
    const { findings, repoSlug, commitHash } = this.props;
    const sortedAndGrouped = this.sortAndGroupByFile(findings);

    return (
      <div
        className={classnames("findings-grouped-list", this.props.className)}
      >
        {Object.keys(sortedAndGrouped)
          .sort()
          .map(fileName => (
            <FindingsGroup
              key={fileName}
              commitHash={commitHash}
              fileName={fileName}
              repoSlug={repoSlug}
              findings={sortedAndGrouped[fileName]}
            />
          ))}
      </div>
    );
  }

  private sortAndGroupByFile = (
    findings: FindingEntry[]
  ): { [file: string]: FindingEntry[] } => {
    const groups = groupBy(findings, finding => finding.fileName);

    return mapValues(groups, group =>
      sortBy(group, ["startLine", "analyzerName", "checkId"])
    );
  };
}
