import ExtensionPromoList from "@r2c/extension/web/ExtensionPromoList";
import Home from "@r2c/extension/web/Home";
import LandingPage from "@r2c/extension/web/LandingPage";
import * as React from "react";
import { Route, Switch } from "react-router";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

export default class App extends React.PureComponent {
  public render() {
    return (
      <>
        <main className="r2c-web-content">
          <BrowserRouter>
            <Switch>
              <Route path="/" exact={true} component={Home} />
              <Route path="/github" component={LandingPage} />
            </Switch>
          </BrowserRouter>
        </main>
        <footer className="r2c-web-app-footer">
          <ExtensionPromoList />
        </footer>
      </>
    );
  }
}
