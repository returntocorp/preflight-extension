import { Classes, Dialog } from "@blueprintjs/core";
import { li } from "@r2c/extension/analytics";
import { RepoHeadsUp } from "@r2c/extension/content/headsup";
import { PreflightChecklistItemType } from "@r2c/extension/content/headsup/PreflightChecklist";
import { ExtractedRepoSlug, parseSlugFromUrl } from "@r2c/extension/utils";
import ExtensionPromoList from "@r2c/extension/web/ExtensionPromoList";
import UnfurlBuilder from "@r2c/extension/web/UnfurlBuilder";
import * as classnames from "classnames";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import "./LandingPage.css";

type LandingPageProps = RouteComponentProps;
interface LandingPageState {
  isInvitationOpen: boolean;
  checklistItemClicked: PreflightChecklistItemType | null;
}

export default class LandingPage extends React.PureComponent<
  LandingPageProps,
  LandingPageState
> {
  public state: LandingPageState = {
    isInvitationOpen: false,
    checklistItemClicked: null
  };

  public render() {
    const { location } = this.props;
    const { checklistItemClicked } = this.state;
    console.log(location.pathname.slice(1));
    const repoSlug = parseSlugFromUrl(`https://${location.pathname.slice(1)}`);

    return (
      <div className="r2c-web-landing-page">
        <UnfurlBuilder
          landingDomain="popular-emu-84.localtunnel.me"
          repoSlug={repoSlug}
        />
        <header>
          <h1>
            {repoSlug.org}/{repoSlug.repo}
          </h1>
        </header>
        <RepoHeadsUp
          repoSlug={repoSlug}
          onChecklistItemClick={this.handleChecklistItemClick}
          detectedLanguages={["javascript"]} // Shim since we can't detect languages obviously
        />
        <Dialog
          isOpen={this.state.isInvitationOpen}
          className="invitation-dialog"
          onClose={this.handleInvitationClose}
        >
          {checklistItemClicked != null && (
            <InvitationModal
              checklistItemClicked={checklistItemClicked}
              repoSlug={repoSlug}
            />
          )}
        </Dialog>
      </div>
    );
  }

  private handleInvitationClose = () =>
    this.setState({ isInvitationOpen: false, checklistItemClicked: null });

  private handleChecklistItemClick: (
    itemType: string
  ) => React.MouseEventHandler<HTMLElement> = (itemType: string) => () => {
    li("landing-page-checklist-item-click", { itemType });
    this.setState({ isInvitationOpen: true });
  };
}

interface InvitationModalProps {
  repoSlug: ExtractedRepoSlug;
  checklistItemClicked: PreflightChecklistItemType;
}

class InvitationModal extends React.PureComponent<InvitationModalProps> {
  public render() {
    const { repoSlug, checklistItemClicked } = this.props;

    return (
      <>
        <ChecklistDetails itemType={checklistItemClicked} />
        <InvitationAside repoSlug={repoSlug} />
      </>
    );
  }
}

interface ChecklistDetailsProps {
  itemType: PreflightChecklistItemType;
}

class ChecklistDetails extends React.PureComponent<ChecklistDetailsProps> {}

interface InvitationAsideProps {
  repoSlug: ExtractedRepoSlug;
}

class InvitationAside extends React.PureComponent<InvitationAsideProps> {
  public render() {
    const { repoSlug } = this.props;

    return (
      <aside className={classnames("invitation-contents", Classes.DIALOG_BODY)}>
        <header>
          <h1>Get this and more with the Preflight extension</h1>
        </header>
        <p>
          See our detailed automated findings and what people are saying about{" "}
          <span className="invitation-repo-insert">
            {repoSlug.org}/{repoSlug.repo}
          </span>{" "}
          when you install the Preflight browser extension.
        </p>
        <ExtensionPromoList />
      </aside>
    );
  }
}
