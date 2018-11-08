import { li } from "@r2c/extension/analytics";
import { RepoHeadsUp } from "@r2c/extension/content/headsup";
import { parseSlugFromUrl } from "@r2c/extension/utils";
import UnfurlBuilder from "@r2c/extension/web/UnfurlBuilder";
import * as React from "react";
import { RouteComponentProps } from "react-router";

type LandingPageProps = RouteComponentProps;

export default class LandingPage extends React.PureComponent<LandingPageProps> {
  public render() {
    const { location } = this.props;
    console.log(location.pathname.slice(1));
    const repoSlug = parseSlugFromUrl(`https://${location.pathname.slice(1)}`);

    return (
      <div className="r2c-web-landing-page">
        <UnfurlBuilder
          landingDomain="strong-kangaroo-95.localtunnel.me"
          repoSlug={repoSlug}
        />
        <h1>
          {repoSlug.org}/{repoSlug.repo}
        </h1>
        <RepoHeadsUp
          repoSlug={repoSlug}
          onChecklistItemClick={this.handleChecklistItemClick}
          detectedLanguages={["JavaScript"]} // Shim since we can't detect languages obviously
        />
      </div>
    );
  }

  private handleChecklistItemClick: (
    itemType: string
  ) => React.MouseEventHandler<HTMLElement> = (itemType: string) => () => {
    li("landing-page-checklist-item-click", { itemType });
  };
}
