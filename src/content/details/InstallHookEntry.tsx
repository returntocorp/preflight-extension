import { ScriptEntry } from "@r2c/extension/api/scripts";
import * as React from "react";

interface PreflightInstallHookProps {
  script: ScriptEntry;
}

export default class PreflightInstallHook extends React.PureComponent<
  PreflightInstallHookProps
> {
  public render() {
    const { script } = this.props;

    return (
      <article className="install-hook">
        <header className="install-hook-type">{script.type}</header>
        <div className="install-hook-script">
          <pre>{script.script}</pre>
        </div>
      </article>
    );
  }
}
