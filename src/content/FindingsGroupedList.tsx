import { FindingEntry } from "@r2c/extension/api/findings";
import * as classnames from "classnames";
import { groupBy, mapValues, sortBy } from "lodash";
import * as React from "react";
import "./FindingsGroupedList.css";

interface FindingsGroupedListProps {
  findings: FindingEntry[];
  className?: string;
}

interface FindingsGroupProps {
  fileName: string;
  findings: FindingEntry[];
}

class FindingsGroup extends React.PureComponent<FindingsGroupProps> {
  public render() {
    return (
      <section className="findings-group">
        <header>{this.props.fileName}</header>
        <div className="findings-group-entries">
          {this.props.findings.map((finding, i) => (
            <div
              className="finding-entry"
              key={`${finding.fileName} ${finding.startLine} ${
                finding.analyzerName
              } ${finding.checkId} ${i}`}
            >
              <span className="finding-entry-startline">
                {finding.startLine}
              </span>
              <span className="finding-entry-checkid">{finding.checkId}</span>
            </div>
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
    const { findings } = this.props;
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
              fileName={fileName}
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
