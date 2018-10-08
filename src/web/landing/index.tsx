import * as classnames from "classnames";
import * as React from "react";
import LandingModal from "./LandingModal";

export default class Landing extends React.PureComponent {
  public render() {
    return (
      <div className={classnames("pf-page", "pf-landing-page")}>
        <main>
          <LandingModal />
        </main>
        <footer className="pf-landing-footer">
          <div className="pf-promo">Promo</div>
          <div className="pf-attrib">
            Brought to you by Return to Corporation
          </div>
        </footer>
      </div>
    );
  }
}
