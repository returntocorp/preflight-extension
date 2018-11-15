import { FindingsResponse } from "@r2c/extension/api/findings";
import FindingsGroupedList from "@r2c/extension/content/FindingsGroupedList";
import { parseSlugFromUrl } from "@r2c/extension/utils";
import * as React from "react";

interface FindingsDetailsProps {
  data: FindingsResponse;
}

export default class FindingsDetails extends React.PureComponent<
  FindingsDetailsProps
> {
  public render() {
    const { data } = this.props;

    if (data != null && data.findings != null) {
      return (
        <FindingsGroupedList
          commitHash={data.commitHash}
          findings={data.findings}
          repoSlug={parseSlugFromUrl(data.gitUrl)}
        />
      );
    } else {
      return null;
    }
  }
}
