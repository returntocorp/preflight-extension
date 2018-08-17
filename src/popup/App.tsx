import * as React from "react";
import "./App.css";

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        R2C Extension, version {this.fetchExtensionVersion()}
      </div>
    );
  }

  private fetchExtensionVersion() {
    return browser.runtime.getManifest().version;
  }
}

export default App;
