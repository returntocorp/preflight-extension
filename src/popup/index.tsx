import { Tab, TabId, Tabs } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import { R2CLogo } from "@r2c/extension/icons";
import ExtensionTab from "@r2c/extension/popup/ExtensionTab";
import FirehoseTab from "@r2c/extension/popup/FirehoseTab";
import * as React from "react";
import "./index.css";

interface GuideState {
  selectedTabId: TabId;
}

class Guide extends React.Component<{}, GuideState> {
  public state: GuideState = {
    selectedTabId: "firehose"
  };

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
        </Tabs>
      </div>
    );
  }

  private handleTabChange = (newTabId: TabId, prevTabId: TabId) => {
    this.setState({ selectedTabId: newTabId });
  };
}

export default Guide;
