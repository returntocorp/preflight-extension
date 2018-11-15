import { ScriptsResponse } from "@r2c/extension/api/scripts";
import PreflightInstallHook from "@r2c/extension/content/details/InstallHookEntry";
import * as React from "react";

interface InstallHooksDetailsProps {
  data: ScriptsResponse;
}

export default class InstallHooksDetails extends React.PureComponent<
  InstallHooksDetailsProps
> {
  public render() {
    const { data } = this.props;

    if (data && data.scripts != null) {
      return (
        <div className="install-hooks">
          {data.scripts.map((script, i) => (
            <PreflightInstallHook script={script} key={`${script.type}_${i}`} />
          ))}
        </div>
      );
    } else {
      return null;
    }
  }
}
