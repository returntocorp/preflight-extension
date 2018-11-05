import { Tab, TabId, Tabs } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import ExtensionTab from "@r2c/extension/popup/ExtensionTab";
import {
  ExperimentName,
  ExtensionState,
  getExtensionState,
  toggleExtensionExperiment
} from "@r2c/extension/shared/ExtensionState";
import {
  fetchOrCreateExtensionUniqueId,
  getGitHubUserFromStorage
} from "@r2c/extension/utils";
import * as React from "react";
import FeedbackTab from "./FeedbackTab";
import "./index.css";

interface GuideState {
  selectedTabId: TabId;
  user: string | undefined;
  installationId: string | undefined;
  extensionState: ExtensionState | undefined;
}

class Guide extends React.Component<{}, GuideState> {
  public state: GuideState = {
    selectedTabId: "firehose",
    user: undefined,
    installationId: undefined,
    extensionState: undefined
  };

  public async componentDidMount() {
    this.fetchCurrentUser();
    this.fetchInstallationId();

    this.setState({ extensionState: await getExtensionState() });
  }

  public render() {
    return (
      <div className="r2c-guide">
        <Tabs
          id="guide-tabs"
          onChange={this.handleTabChange}
          selectedTabId={this.state.selectedTabId}
          animate={true}
          renderActiveTabPanelOnly={true}
          className="r2c-guide-tabs"
        >
          <Tabs.Expander />
          <Tab
            id="feedback"
            title="Feedback"
            panel={
              <FeedbackTab
                user={this.state.user}
                installationId={this.state.installationId}
              />
            }
          />
          <Tab
            id="extension"
            title="Settings"
            panel={
              <ExtensionTab
                extensionState={this.state.extensionState}
                onToggleExperiment={this.handleToggleExtensionExperiment}
              />
            }
          />
        </Tabs>
      </div>
    );
  }

  private handleToggleExtensionExperiment = (
    experimentName: ExperimentName
  ) => (e: React.FormEvent<HTMLInputElement>) => {
    if (this.state.extensionState != null) {
      this.setState({
        extensionState: toggleExtensionExperiment(
          this.state.extensionState,
          experimentName
        )
      });
    }
  };

  private fetchCurrentUser = async () => {
    const user = await getGitHubUserFromStorage();

    if (user != null) {
      this.setState({ user });
    }
  };

  private fetchInstallationId = async () => {
    const installationId = await fetchOrCreateExtensionUniqueId();

    this.setState({ installationId });
  };

  private handleTabChange = (newTabId: TabId, prevTabId: TabId) => {
    this.setState({ selectedTabId: newTabId });
  };
}

export default Guide;
