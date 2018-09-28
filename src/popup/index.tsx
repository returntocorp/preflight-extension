import { Tab, TabId, Tabs } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import { R2CLogo } from "@r2c/extension/icons";
import ExtensionTab from "@r2c/extension/popup/ExtensionTab";
import FirehoseTab from "@r2c/extension/popup/FirehoseTab";
import ProfileTab from "@r2c/extension/popup/ProfileTab";
import {
  ExtensionState,
  getExtensionState,
  toggleExtensionExperiment
} from "@r2c/extension/shared/ExtensionState";
import { getGitHubUserFromStorage } from "@r2c/extension/utils";
import * as React from "react";
import "./index.css";

interface GuideState {
  selectedTabId: TabId;
  currentUser: string | undefined;
  extensionState: ExtensionState | undefined;
}

class Guide extends React.Component<{}, GuideState> {
  public state: GuideState = {
    selectedTabId: "firehose",
    currentUser: undefined,
    extensionState: undefined
  };

  public async componentDidMount() {
    this.fetchCurrentUser();

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
          className="r2c-guide-tabs"
        >
          <Tab
            id="extension"
            title={
              <div className="r2c-tab">
                <R2CLogo />
              </div>
            }
            panel={
              <ExtensionTab
                extensionState={this.state.extensionState}
                onToggleExperiment={this.handleToggleExtensionExperiment}
              />
            }
          />
          <Tab id="firehose" title="Activity Feed" panel={<FirehoseTab />} />
          <Tabs.Expander />
          {this.state.currentUser && (
            <Tab
              id="profile"
              title="Inbox"
              panel={<ProfileTab user={this.state.currentUser} />}
            />
          )}
        </Tabs>
      </div>
    );
  }

  private handleToggleExtensionExperiment = (experimentName: string) => (
    e: React.FormEvent<HTMLInputElement>
  ) => {
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
    const currentUser = await getGitHubUserFromStorage();

    if (currentUser != null) {
      this.setState({ currentUser });
    }
  };

  private handleTabChange = (newTabId: TabId, prevTabId: TabId) => {
    this.setState({ selectedTabId: newTabId });
  };
}

export default Guide;
