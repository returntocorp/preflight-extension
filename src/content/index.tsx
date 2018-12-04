import { Hotkey, Hotkeys, HotkeysTarget } from "@blueprintjs/core";
import { FindingEntry, FindingsFetch } from "@r2c/extension/api/findings";
import { PermissionsFetch, PermissionsResponse } from "@r2c/extension/api/permissions";
import BlobFindingsInjector from "@r2c/extension/content/github/BlobFindingsInjector";
import { naivelyExtractCurrentUserFromPage } from "@r2c/extension/content/github/dom";
import TreeFindingsInjector from "@r2c/extension/content/github/TreeFindingsInjector";
import RepoHeadsUpInjector from "@r2c/extension/content/headsup";
import PreflightTwist from "@r2c/extension/content/PreflightTwist";
import Twist, { TwistId } from "@r2c/extension/content/Twist";
import Twists from "@r2c/extension/content/Twists";
import { ExtensionState, getExtensionState } from "@r2c/extension/shared/ExtensionState";
import { fetchOrCreateExtensionUniqueId, getCurrentUrlWithoutHash, isGitHubSlug, isRepositoryPrivate, naivelyExtractSlugFromCurrentUrl } from "@r2c/extension/utils";
import { concat, flatten, get } from "lodash";
import * as React from "react";
import { PlaneIcon } from "../icons";
import DOMInjector from "./github/DomInjector";
import { PreflightChecklistItemType } from "./headsup/PreflightChecklist";
import "./index.css";

interface ContentHostState {
  twistTab: TwistId | undefined;
  user: string | undefined;
  installationId: string | undefined;
  extensionState: ExtensionState | undefined;
  currentUrl: string | undefined;
  navigationNonce: number;
  checklistItem: PreflightChecklistItemType | undefined;
}

const DEFAULT_STATE: ContentHostState = {
  twistTab: undefined,
  user: undefined,
  installationId: undefined,
  extensionState: undefined,
  currentUrl: undefined,
  navigationNonce: 0,
  checklistItem: undefined
};

export const ExtensionContext = React.createContext<ContentHostState>(
  DEFAULT_STATE
);

class ContentHost extends React.Component<{}, ContentHostState> {
  public state: ContentHostState = DEFAULT_STATE;

  private repoSlug = naivelyExtractSlugFromCurrentUrl();

  private navigationMutationObserver: MutationObserver | null = null;

  public async componentDidMount() {
    const { user, installationId } = await this.getCurrentUser();
    const extensionState = await getExtensionState();
    const currentUrl = getCurrentUrlWithoutHash();
    this.watchNavigationChange();
    this.setState({
      extensionState,
      currentUrl,
      user,
      installationId
    });
  }

  public render() {
    const { twistTab, installationId } = this.state;

    if (isRepositoryPrivate()) {
      return null;
    }

    if (!isGitHubSlug(this.repoSlug)) {
      return null;
    }

    if (installationId == null) {
      return null;
    }

    return (
      <div className="r2c-content-host">
        <ExtensionContext.Provider value={this.state}>
          <div id={DOMInjector.DEFAULT_INJECTION_ID} />
          <div className="r2c-host">
            <RepoHeadsUpInjector
              key={`RepoHeadsUpInjector ${this.state.currentUrl} ${
                this.state.navigationNonce
              }`}
              repoSlug={this.repoSlug}
              onChecklistItemClick={this.handleChecklistItemClick}
            />
            {this.repoSlug != null && (
              <FindingsFetch repoSlug={this.repoSlug}>
                {({
                  data: findingsData,
                  loading: findingsLoading,
                  error: findingsError
                }) => (
                  <PermissionsFetch repoSlug={this.repoSlug}>
                    {({
                      data: permissionsData,
                      loading: permissionsLoading,
                      error: permissionsError
                    }) => {
                      const findings = flatten(
                        concat(
                          this.getFindingsFromPermissionsData(permissionsData),
                          findingsData != null && findingsData.findings != null
                            ? findingsData.findings
                            : []
                        )
                      );

                      const commitHash =
                        get(permissionsData, "commitHash") ||
                        get(findingsData, "commitHash");

                      if (commitHash == null) {
                        return;
                      }

                      return (
                        <>
                          <BlobFindingsInjector
                            key={`BlobFindingsInjector ${
                              this.state.currentUrl
                            } ${this.state.navigationNonce}`}
                            findingCommitHash={commitHash}
                            findings={findings}
                            repoSlug={this.repoSlug}
                          />
                          <TreeFindingsInjector
                            key={`TreeFindingsInjector ${
                              this.state.currentUrl
                            } ${this.state.navigationNonce}`}
                            findings={findings}
                            commitHash={commitHash}
                            repoSlug={this.repoSlug}
                          />
                        </>
                      );
                    }}
                  </PermissionsFetch>
                )}
              </FindingsFetch>
            )}
            <Twists
              isOpen={twistTab != null}
              selectedTwistId={twistTab}
              onTwistChange={this.handleTwistChange}
            >
              <Twist
                id="preflight"
                title="Details"
                icon={<PlaneIcon />}
                panel={
                  <PreflightTwist
                    repoSlug={this.repoSlug}
                    deepLink={this.state.checklistItem}
                  />
                }
              />
            </Twists>
          </div>
        </ExtensionContext.Provider>
      </div>
    );
  }

  public renderHotkeys() {
    return (
      <Hotkeys>
        <Hotkey
          combo="esc"
          label="Close Preflight side-panel"
          onKeyDown={this.handleCloseHotKey}
        />
        ;
      </Hotkeys>
    );
  }

  private handleCloseHotKey = () => {
    this.setState({ twistTab: undefined });
  };

  private handleChecklistItemClick = (itemType: PreflightChecklistItemType) => (
    e: React.MouseEvent<HTMLElement>
  ) => {
    this.setState({ twistTab: "preflight", checklistItem: itemType });
  };

  private watchNavigationChange() {
    this.navigationMutationObserver = new MutationObserver(
      this.handleLoadingMutation
    );

    const main = document.querySelector("#js-pjax-loader-bar");

    if (main != null) {
      this.navigationMutationObserver.observe(main, {
        attributes: true,
        attributeFilter: ["class"],
        attributeOldValue: true
      });
    } else {
      console.warn("Unable to register mutation observer!");
    }
  }

  private handleLoadingMutation: MutationCallback = mutations => {
    mutations.forEach(mutation => {
      switch (mutation.type) {
        case "attributes":
          if (mutation.target.nodeType === Node.ELEMENT_NODE) {
            const mutationElem = mutation.target as Element;
            if (
              !mutationElem.classList.contains("is-loading") &&
              mutation.oldValue != null &&
              mutation.oldValue.indexOf("is-loading") >= 0
            ) {
              this.handleNavigationChange();
            }
          }
          break;
        default:
      }
    });
  };

  private handleNavigationChange = () => {
    const locationWithoutHash = getCurrentUrlWithoutHash();

    this.setState({ navigationNonce: this.state.navigationNonce + 1 });

    if (locationWithoutHash !== this.state.currentUrl) {
      this.setState({ currentUrl: locationWithoutHash });
    }
  };

  private getCurrentUser = async (): Promise<{
    user: string | undefined;
    installationId: string | undefined;
  }> => {
    const installationId = await fetchOrCreateExtensionUniqueId();
    const user = await naivelyExtractCurrentUserFromPage();

    return { user, installationId };
  };

  private handleTwistChange = (
    twist: TwistId,
    e: React.MouseEvent<HTMLInputElement>
  ) => {
    if (this.state.twistTab !== twist) {
      this.setState({ twistTab: twist, checklistItem: undefined });
    } else {
      this.setState({ twistTab: undefined, checklistItem: undefined });
    }
  };

  private getFindingsFromPermissionsData = (
    permissionsData: PermissionsResponse | undefined
  ): FindingEntry[] => {
    const permissionLocations: FindingEntry[] = [];
    if (permissionsData == null || permissionsData.permissions == null) {
      return permissionLocations;
    }
    Object.keys(permissionsData.permissions).map(key => {
      permissionLocations.push(...permissionsData.permissions[key].locations);
    });

    return permissionLocations;
  };
}

export default HotkeysTarget(ContentHost);
