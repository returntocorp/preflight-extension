import { PermissionsResponse } from "@r2c/extension/api/permissions";
import FindingsGroupedList from "@r2c/extension/content/FindingsGroupedList";
import { parseSlugFromUrl } from "@r2c/extension/utils";
import * as React from "react";

interface PermissionsDetailsProps {
  data: PermissionsResponse;
}

export default class PermissionsDetails extends React.PureComponent<
  PermissionsDetailsProps
> {
  public render() {
    const { data } = this.props;

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
                    repoSlug={parseSlugFromUrl(data.gitUrl)}
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
