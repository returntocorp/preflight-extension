import { PermissionsResponse } from "@r2c/extension/api/permissions";
import FindingsGroupedList from "@r2c/extension/content/FindingsGroupedList";
import { ExtractedRepoSlug, parseSlugFromUrl } from "@r2c/extension/utils";
import * as React from "react";

interface PermissionsDetailsProps {
  data: PermissionsResponse;
  repoSlug?: ExtractedRepoSlug;
}

export default class PermissionsDetails extends React.PureComponent<
  PermissionsDetailsProps
> {
  public render() {
    const { data, repoSlug } = this.props;

    if (data != null && data.permissions != null) {
      return (
        <>
          {Object.keys(data.permissions).map(
            key =>
              data.permissions[key].found && (
                <div className="permission-entry" key={key}>
                  <span className="permission-entry-name">
                    {data.permissions[key].displayName}
                  </span>
                  <FindingsGroupedList
                    commitHash={data.commitHash}
                    findings={data.permissions[key].locations}
                    repoSlug={repoSlug || parseSlugFromUrl(data.gitUrl)}
                  />
                </div>
              )
          )}
        </>
      );
    } else {
      return null;
    }
  }
}
