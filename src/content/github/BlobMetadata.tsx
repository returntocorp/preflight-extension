import {
  ExtractedRepoSlug,
  extractSlugFromCurrentUrl
} from "@r2c/extension/utils";
import { last } from "lodash";
import * as React from "react";

interface BlobMetadataProps {
  children(state: BlobMetadataState): React.ReactNode;
}

interface BlobMetadataState {
  filePath: string;
  commitHash: string | null;
}

export default class BlobMetadata extends React.Component<
  BlobMetadataProps,
  Partial<BlobMetadataState>
> {
  public state: Partial<BlobMetadataState> = {
    filePath: undefined,
    commitHash: undefined
  };

  public componentDidMount() {
    this.extractBlobMetadata();
  }

  public componentDidUpdate() {
    this.extractBlobMetadata();
  }

  public render() {
    if (this.state.filePath != null) {
      return this.props.children(this.state as BlobMetadataState);
    }

    return null;
  }

  private extractBlobMetadata = () => {
    const slug = extractSlugFromCurrentUrl();

    this.extractBlobPath(slug);
    this.extractCommitHash(slug);
  };

  private extractBlobPath = (slug: ExtractedRepoSlug) => {
    if (slug.rest.startsWith("blob")) {
      const pathName = slug.rest.split("/");
      const filePath = pathName.slice(2).join("/");
      this.updateBlobPath(filePath);
    } else {
      this.clearState();
    }
  };

  private extractCommitHash = (slug: ExtractedRepoSlug) => {
    if (slug.rest.startsWith("blob")) {
      const commitNode = document.querySelector(".commit-tease-sha");
      const commitLink =
        commitNode != null ? commitNode.getAttribute("href") : null;
      const commitHash =
        commitLink != null
          ? last(commitLink.split("/")) || undefined
          : undefined;

      this.updateCommitHash(commitHash);
    } else {
      this.clearState();
    }
  };

  private updateBlobPath = (blobPath: string) => {
    if (this.state.filePath !== blobPath) {
      this.setState({ filePath: blobPath });
    }
  };

  private updateCommitHash = (commitHash: string | undefined) => {
    if (this.state.commitHash !== commitHash) {
      this.setState({ commitHash });
    }
  };

  private clearState = () => {
    if (this.state.filePath != null || this.state.commitHash != null) {
      this.setState({ filePath: undefined, commitHash: undefined });
    }
  };
}
