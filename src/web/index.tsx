import LandingPage from "@r2c/extension/web/LandingPage";
import PreflightLogo from "@r2c/extension/web/PreflightLogo";
import * as React from "react";
import "./index.css";

export default class App extends React.PureComponent {
  public render() {
    return (
      <section className="r2c-web-placeholder">
        <div className="preflight-logo">
          <PreflightLogo />
          <LandingPage />
        </div>
      </section>
    );
  }
}
