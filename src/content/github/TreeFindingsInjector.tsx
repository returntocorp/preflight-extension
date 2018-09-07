import { Popover, Position } from "@blueprintjs/core";
import { FindingEntry } from "@r2c/extension/api/findings";
import FindingsGroupedList from "@r2c/extension/content/FindingsGroupedList";
import TreeMetadata from "@r2c/extension/content/github/TreeMetadata";
import { ExtractedRepoSlug } from "@r2c/extension/utils";
import * as React from "react";
import * as ReactDOM from "react-dom";
import "./TreeFindingsInjector.css";

interface TreeFindingsInjectorProps {
  findings: FindingEntry[];
  repoSlug: ExtractedRepoSlug;
}

interface TreeFindingsHighlighterProps extends TreeFindingsInjectorProps {
  currentPath: string;
}

interface TreeFindingHighlightProps {
  findings: FindingEntry[];
  path: string;
}

class TreeFindingHighlight extends React.PureComponent<
  TreeFindingHighlightProps
> {
  public componentWillUnmount() {
    // console.log("Unmounting TreeFindingHighlight:", this.props.path);
  }

  public render() {
    const { findings, path } = this.props;

    const pathElem = document.querySelector(
      `a[title='${path}'].js-navigation-open`
    );

    if (pathElem == null || pathElem.parentElement == null) {
      return null;
    }

    const destination = pathElem.parentElement;
    const existingElem = destination.querySelector(
      ".r2c-tree-finding-highlight-marker"
    );

    if (existingElem != null) {
      // HACK: GitHub uses pjax for navigation, which can save a snapshot of the DOM before
      // React has a chance to unmount the portal. If we find a previous portal, let's get rid
      // of it before mounting a new one.
      // console.log("Remove existing elements");

      existingElem.remove();
    }

    return ReactDOM.createPortal(
      <Popover
        content={
          <FindingsGroupedList
            findings={findings}
            className="r2c-tree-findings-grouped-list"
          />
        }
        position={Position.LEFT_TOP}
        minimal={true}
        modifiers={{
          preventOverflow: { boundariesElement: "viewport" },
          offset: { offset: "0px 40px" }
        }}
      >
        <span className="r2c-tree-finding-highlight-marker">
          <span className="r2c-tree-finding-count">{findings.length}</span>{" "}
          {`issue${findings.length === 1 ? "" : "s"}`}
        </span>
      </Popover>,
      destination
    );
  }
}

class TreeFindingsHighlighter extends React.PureComponent<
  TreeFindingsHighlighterProps
> {
  public componentWillUnmount() {
    // console.log("Unmounting TreeFindingsHighlighter");
  }

  public render() {
    const { currentPath, findings } = this.props;

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

export default class TreeFindingsInjector extends React.Component<
  TreeFindingsInjectorProps
> {
  public componentWillUnmount() {
    // console.log("Unmounting TreeFindingsInjector");
  }

  public render() {
    return (
      <TreeMetadata>
        {({ currentPath }) => (
          <TreeFindingsHighlighter
            currentPath={currentPath}
            findings={this.props.findings}
            repoSlug={this.props.repoSlug}
          />
        )}
      </TreeMetadata>
    );
  }
}
