import { FindingsResponse } from "@r2c/extension/api/findings";
import FindingsGroupedList from "@r2c/extension/content/FindingsGroupedList";
import { ExtractedRepoSlug, parseSlugFromUrl } from "@r2c/extension/utils";
import * as React from "react";

interface FindingsDetailsProps {
  data: FindingsResponse;
  repoSlug?: ExtractedRepoSlug;
}

export default class FindingsDetails extends React.PureComponent<
  FindingsDetailsProps
> {
  public render() {
    const { data, repoSlug } = this.props;

    if (data != null && data.findings != null) {
      return (
        <FindingsGroupedList
          commitHash={data.commitHash}
          findings={data.findings}
          repoSlug={repoSlug || parseSlugFromUrl(data.gitUrl)}
        />
      );
    } else {
      return null;
    }
  }
}
