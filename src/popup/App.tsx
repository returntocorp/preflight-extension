import { fetchExtensionVersion } from "@r2c/extension/utils";
import * as React from "react";
import "./App.css";

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        R2C Extension, version {fetchExtensionVersion()}
      </div>
    );
  }
}

export default App;
