import { Classes, Dialog, NonIdealState, Spinner } from "@blueprintjs/core";
import { li } from "@r2c/extension/analytics";
import { ApiFetchComponent } from "@r2c/extension/api/fetch";
import { FindingsFetch } from "@r2c/extension/api/findings";
import FindingsDetails from "@r2c/extension/content/details/FindingsDetails";
import { RepoHeadsUp } from "@r2c/extension/content/headsup";
import { PreflightChecklistItemType } from "@r2c/extension/content/headsup/PreflightChecklist";
import { ExtractedRepoSlug, parseSlugFromUrl } from "@r2c/extension/utils";
import ExtensionPromoList from "@r2c/extension/web/ExtensionPromoList";
import * as classnames from "classnames";
import * as React from "react";
import { FetchResult } from "react-fetch-component";
import { RouteComponentProps } from "react-router";
import "./LandingPage.css";

interface ChecklistDetailsProps {
  itemType: PreflightChecklistItemType;
  repoSlug: ExtractedRepoSlug;
}

export class ChecklistDetailsRouter extends React.PureComponent<
  ChecklistDetailsProps
> {
  public render() {
    const { itemType, repoSlug } = this.props;

    switch (itemType) {
      case "findings":
        return (
          <ChecklistDetailsStack
            fetchComponent={FindingsFetch}
            repoSlug={repoSlug}
          >
            {({ data }) => <FindingsDetails data={data} />}
          </ChecklistDetailsStack>
        );
      default:
        return <NonIdealState icon="offline" title="Couldn't load details" />;
    }
  }
}

interface FetchDataWrapper<T> {
  data: T;
}

interface ChecklistDetailsStackProps<T> {
  fetchComponent: ApiFetchComponent<T>;
  repoSlug: ExtractedRepoSlug;
  children(wrapper: FetchDataWrapper<T>): React.ReactNode;
}

class ChecklistDetailsStack<T> extends React.PureComponent<
  ChecklistDetailsStackProps<T>
> {
  public render() {
    const { fetchComponent: ChecklistFetchComponent, repoSlug } = this.props;

    return (
      <ChecklistFetchComponent repoSlug={repoSlug}>
        {this.renderFetchResult}
      </ChecklistFetchComponent>
    );
  }

  private renderFetchResult: (result: FetchResult<T>) => React.ReactNode = ({
    data,
    loading,
    error
  }) => {
    if (loading) {
      return <NonIdealState icon={<Spinner />} title="Loading..." />;
    } else if (error != null) {
      return (
        <NonIdealState
          icon="heart-broken"
          title="Error"
          description={JSON.stringify(error)}
        />
      );
    } else if (data != null) {
      return this.props.children({ data });
    } else {
      return null;
    }
  };
}

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

interface InvitationModalProps {
  repoSlug: ExtractedRepoSlug;
  checklistItemClicked: PreflightChecklistItemType;
}

class InvitationModal extends React.PureComponent<InvitationModalProps> {
  public render() {
    const { repoSlug } = this.props;

    return <InvitationAside repoSlug={repoSlug} />;
  }
}

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
    itemType: PreflightChecklistItemType
  ) => React.MouseEventHandler<HTMLElement> = itemType => () => {
    li("landing-page-checklist-item-click", { itemType });
    this.setState({ isInvitationOpen: true, checklistItemClicked: itemType });
  };
}
