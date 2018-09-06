import { FindingEntry } from "@r2c/extension/api/findings";
import { ExtractedRepoSlug } from "@r2c/extension/utils";
import * as React from "react";

interface TreeFindingsInjectorProps {
  findings: FindingEntry[];
  repoSlug: ExtractedRepoSlug;
}

export default class TreeFindingsInjector extends React.Component<
  TreeFindingsInjectorProps
> {
  public render() {
    return null;
  }
}
