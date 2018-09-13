import { Button, Icon, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { l } from "@r2c/extension/analytics";
import DomElementLoadedWatcher from "@r2c/extension/content/github/DomElementLoadedWatcher";
import { ErrorHeadsUp } from "@r2c/extension/content/headsup/NonIdealHeadsup";
import { PreflightChecklist } from "@r2c/extension/content/headsup/PreflightChecklist";
import RepoPackageSection from "@r2c/extension/content/PackageCopyBox";
import { R2CLogo } from "@r2c/extension/icons";
import * as React from "react";
import * as ReactDOM from "react-dom";
import "./index.css";

interface HeadsupState {
  closed: boolean;
}

class NormalHeadsUp extends React.PureComponent<{}, HeadsupState> {
  public state: HeadsupState = {
    closed: false
  };

  public render() {
    if (this.state.closed) {
      return null;
    }

    return (
      <div className="r2c-repo-headsup checklist-headsup">
        <header>
          <Button
            icon={IconNames.SMALL_CROSS}
            minimal={true}
            onClick={l("preflight-closed", this.closeMessage)}
          />
        </header>
        <div className="repo-headsup-body">
          <div className="repo-headsup-checklist">
            <PreflightChecklist />
          </div>
          <div className="repo-headsup-actions">
            <RepoPackageSection />
          </div>
        </div>
        <footer>
          <div className="preflight-legend">
            <span className="legend-check legend-entry">
              <Icon icon={IconNames.SMALL_TICK} intent={Intent.SUCCESS} /> Good
            </span>
            <span className="legend-warn legend-entry">
              <Icon
                icon={IconNames.SYMBOL_TRIANGLE_UP}
                intent={Intent.WARNING}
              />{" "}
              Careful
            </span>
            <span className="legend-missing legend-entry">
              <Icon icon={IconNames.MINUS} /> N/A
            </span>
          </div>
          <div className="preflight-footer-side">
            <div className="preflight-logo">
              preflight <R2CLogo />
            </div>
          </div>
        </footer>
      </div>
    );
  }

  private closeMessage: React.MouseEventHandler<HTMLElement> = e => {
    this.setState({ closed: true });
  };
}

interface RepoHeadsUpState {
  error: React.ErrorInfo | undefined;
}

class RepoHeadsUp extends React.PureComponent<{}, RepoHeadsUpState> {
  public state: RepoHeadsUpState = {
    error: undefined
  };

  public componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ error: info });
  }

  public render() {
    const navigation = document.querySelector(".repository-lang-stats-graph");
    const existingElem = document.querySelector(".r2c-repo-headsup-container");

    if (navigation == null) {
      return null;
    }

    if (existingElem != null) {
      existingElem.remove();
    }

    const injected = document.createElement("div");
    injected.classList.add("r2c-repo-headsup-container");
    navigation.after(injected);

    return ReactDOM.createPortal(
      <div className="preflight-container">
        {this.state.error != null && <ErrorHeadsUp error={this.state.error} />}
        {this.state.error == null && <NormalHeadsUp />}
      </div>,
      injected
    );
  }
}

export default class RepoHeadsUpInjector extends React.PureComponent {
  public render() {
    return (
      <DomElementLoadedWatcher querySelector=".repository-lang-stats-graph">
        {({ done }) => done && <RepoHeadsUp />}
      </DomElementLoadedWatcher>
    );
  }
}
