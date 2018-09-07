import { extractSlugFromCurrentUrl } from "@r2c/extension/utils";
import { last } from "lodash";
import * as React from "react";

interface TreeMetadataProps {
  children(state: TreeMetadataState): React.ReactNode;
}

interface TreeMetadataState {
  currentPath: string;
  commitHash: string;
}

export default class TreeMetadata extends React.Component<
  TreeMetadataProps,
  Partial<TreeMetadataState>
> {
  public state: Partial<TreeMetadataState> = {
    currentPath: undefined,
    commitHash: undefined
  };

  private retryAttempts = 0;

  public componentDidMount() {
    this.extractTreeMetadata();
  }

  public componentDidUpdate() {
    this.extractTreeMetadata();
  }

  public render() {
    if (this.state.currentPath != null && this.state.commitHash != null) {
      return this.props.children(this.state as TreeMetadataState);
    }

    return null;
  }

  private extractTreeMetadata = () => {
    const { rest } = extractSlugFromCurrentUrl();
    const commitNode = document.querySelector(".commit-tease-sha");
    const commitLink =
      commitNode != null ? commitNode.getAttribute("href") : null;
    const commitHash =
      commitLink != null ? last(commitLink.split("/")) || undefined : undefined;

    // FIXME do this better
    if (commitHash == null && this.retryAttempts < 3) {
      setTimeout(() => {
        this.retryAttempts += 1;
        this.extractTreeMetadata();
      }, 1000);
    }

    if (rest.startsWith("tree")) {
      const pathName = rest.split("/");
      const currentPath = `${pathName.slice(2).join("/")}/`;
      this.updateMetadata(currentPath, commitHash);
    } else if (rest.length === 0) {
      // at root
      this.updateMetadata("", commitHash);
    } else {
      this.clearMetadata();
    }
  };

  private updateMetadata(currentPath: string, commitHash: string | undefined) {
    if (
      this.state.currentPath !== currentPath ||
      this.state.commitHash !== commitHash
    ) {
      this.setState({ currentPath, commitHash });
    }
  }

  private clearMetadata() {
    if (this.state.currentPath != null || this.state.commitHash != null) {
      this.setState({ currentPath: undefined, commitHash: undefined });
    }
  }
}
