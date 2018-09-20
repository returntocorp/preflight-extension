import { Popover, Position } from "@blueprintjs/core";
import { l } from "@r2c/extension/analytics";
import { FindingEntry } from "@r2c/extension/api/findings";
import FindingsGroupedList from "@r2c/extension/content/FindingsGroupedList";
import DomElementLoadedWatcher from "@r2c/extension/content/github/DomElementLoadedWatcher";
import TreeMetadata from "@r2c/extension/content/github/TreeMetadata";
import { ExtractedRepoSlug } from "@r2c/extension/utils";
import * as React from "react";
import DOMInjector from "./DomInjector";
import "./TreeFindingsInjector.css";

interface TreeFindingsInjectorProps {
  findings: FindingEntry[];
  commitHash: string;
  repoSlug: ExtractedRepoSlug;
}

interface TreeFindingsHighlighterProps extends TreeFindingsInjectorProps {
  currentPath: string;
}

interface TreeFindingHighlightProps {
  findings: FindingEntry[];
  commitHash: string;
  path: string;
}

class TreeFindingHighlight extends React.PureComponent<
  TreeFindingHighlightProps
> {
  public render() {
    const { findings, commitHash, path } = this.props;

    return (
      <DOMInjector
        destination={`a[title='${path}'].js-navigation-open`}
        childClassName="r2c-tree-finding-highlight-popover"
        injectedClassName="r2c-tree-finding-highlight"
        relation="after"
      >
        <Popover
          className="r2c-tree-finding-highlight-popover"
          content={
            <FindingsGroupedList
              findings={findings}
              commitHash={commitHash}
              className="r2c-tree-findings-grouped-list"
            />
          }
          position={Position.LEFT_TOP}
          minimal={true}
          modifiers={{
            preventOverflow: { boundariesElement: "viewport" },
            offset: { offset: "0px,40px" }
          }}
          onOpened={l("tree-finding-highlight-click", undefined, { path })}
        >
          <span className="r2c-tree-finding-highlight-marker">
            <span className="r2c-tree-finding-count">{findings.length}</span>{" "}
            {`issue${findings.length === 1 ? "" : "s"}`}
          </span>
        </Popover>
      </DOMInjector>
    );
  }
}

class TreeFindingsHighlighter extends React.PureComponent<
  TreeFindingsHighlighterProps
> {
  public render() {
    const { currentPath, findings, commitHash } = this.props;

    const filtered = findings.filter(finding =>
      finding.fileName.startsWith(currentPath)
    );

    if (filtered.length === 0) {
      return null;
    }

    const immediatePathChildren = new Set(
      filtered.map(
        // Remove the current path from the filename including slash, then get
        // the immediate child component
        finding => finding.fileName.slice(currentPath.length).split("/")[0]
      )
    );

    // FIXME 🤔
    return (
      <>
        {[...immediatePathChildren.values()].map(directoryEntry => (
          <TreeFindingHighlight
            key={directoryEntry}
            commitHash={commitHash}
            findings={filtered.filter(finding =>
              finding.fileName
                .slice(currentPath.length)
                .startsWith(directoryEntry)
            )}
            path={directoryEntry}
          />
        ))}
      </>
    );
  }
}

export default class TreeFindingsInjector extends React.PureComponent<
  TreeFindingsInjectorProps
> {
  public render() {
    return (
      <DomElementLoadedWatcher
        querySelector={["table.files", ".commit-tease-sha"]}
      >
        {({ done }) => (
          <>
            {done && (
              <TreeMetadata>
                {({ currentPath }) => (
                  <TreeFindingsHighlighter
                    currentPath={currentPath}
                    findings={this.props.findings}
                    commitHash={this.props.commitHash}
                    repoSlug={this.props.repoSlug}
                  />
                )}
              </TreeMetadata>
            )}
          </>
        )}
      </DomElementLoadedWatcher>
    );
  }
}
