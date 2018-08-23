import { Tab, TabId, Tabs } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import { R2CLogo } from "@r2c/extension/icons";
import ExtensionTab from "@r2c/extension/popup/ExtensionTab";
import FirehoseTab from "@r2c/extension/popup/FirehoseTab";
import ProfileTab from "@r2c/extension/popup/ProfileTab";
import Top10Tab from "@r2c/extension/popup/Top10Tab";
import * as React from "react";
import "./index.css";

interface GuideState {
  selectedTabId: TabId;
  currentUser: string | undefined;
}

class Guide extends React.Component<{}, GuideState> {
  public state: GuideState = {
    selectedTabId: "firehose",
    currentUser: undefined
  };

  public componentDidMount() {
    this.fetchCurrentUser();
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
            title={<div className="r2c-tab">{R2CLogo}</div>}
            panel={<ExtensionTab />}
          />
          <Tab id="firehose" title="Firehose" panel={<FirehoseTab />} />
          <Tab id="top10" title="Top 10" panel={<Top10Tab />} />
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

  private fetchCurrentUser = async () => {
    browser.storage.local.get(
      "MOST_RECENT_GITHUB_USER",
      ({
        MOST_RECENT_GITHUB_USER
      }: {
        MOST_RECENT_GITHUB_USER: string | undefined;
      }) => {
        if (MOST_RECENT_GITHUB_USER != null) {
          this.setState({ currentUser: MOST_RECENT_GITHUB_USER });
        }
      }
    );
  };

  private handleTabChange = (newTabId: TabId, prevTabId: TabId) => {
    this.setState({ selectedTabId: newTabId });
  };
}

export default Guide;
