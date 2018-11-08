import chromeLogo from "@r2c/extension/static/get_chrome.png";
import firefoxLogo from "@r2c/extension/static/get_firefox.png";
import * as React from "react";
import "./ExtensionPromoList.css";

interface ExtensionPromoProps {
  extensionId: string;
}

class ChromePromo extends React.PureComponent<ExtensionPromoProps> {
  public render() {
    return (
      <a
        className="extension-source-button extension-source-chrome"
        href={`https://chrome.google.com/webstore/detail/${
          this.props.extensionId
        }`}
      >
        <img
          className="extension-source-icon"
          src={chromeLogo}
          role="button"
          alt="Get Preflight at Chrome Web Store"
        />
      </a>
    );
  }
}

class FirefoxPromo extends React.PureComponent<ExtensionPromoProps> {
  public render() {
    return (
      <a
        className="extension-source-button extension-source-firefox"
        href={`https://addons.mozilla.org/en-US/firefox/addon/${
          this.props.extensionId
        }/`}
      >
        <img
          className="extension-source-icon"
          src={firefoxLogo}
          role="button"
          alt="Get Preflight at Firefox Add-ons"
        />
      </a>
    );
  }
}

export default class ExtensionPromo extends React.PureComponent {
  public render() {
    return (
      <div className="extension-promo">
        <div className="extension-source-list">
          <ChromePromo extensionId="emaioeinhnifhcmlihcbooknbpjdbllb" />
          <FirefoxPromo extensionId="r2c-beta" />
        </div>
      </div>
    );
  }
}
