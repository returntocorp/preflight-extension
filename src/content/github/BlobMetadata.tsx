import { extractSlugFromCurrentUrl } from "@r2c/extension/utils";
import { last } from "lodash";
import * as React from "react";

interface BlobMetadataProps {
  children(state: BlobMetadataState): React.ReactNode;
}

interface BlobMetadataState {
  filePath: string;
  commitHash: string;
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
    setTimeout(() => {
      this.prepareFileMetadata();
    }, 1000);
  }

  public render() {
    if (this.state.filePath != null && this.state.commitHash != null) {
      return this.props.children(this.state as BlobMetadataState);
    }

    return null;
  }

  private prepareFileMetadata = () => {
    const { rest } = extractSlugFromCurrentUrl();

    if (rest.startsWith("blob")) {
      const pathName = rest.split("/");
      const commitNode = document.querySelector(".commit-tease-sha");
      const commitLink =
        commitNode != null ? commitNode.getAttribute("href") : null;
      const commitHash =
        commitLink != null
          ? last(commitLink.split("/")) || undefined
          : undefined;

      const filePath = pathName.slice(2).join("/");

      this.setState({ filePath, commitHash });
    }
  };
}
