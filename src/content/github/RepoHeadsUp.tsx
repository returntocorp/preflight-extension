
import { Button, ButtonGroup, Icon, Intent, NonIdealState, Spinner } from "@blueprintjs/core";
import { IconName, IconNames } from "@blueprintjs/icons";
import { WARNING_SIGN } from "@blueprintjs/icons/lib/esm/generated/iconNames";
import { PermissionsResponse, permissionsUrl } from "@r2c/extension/api/permissions";
import { Activity, RepoResponse, repoUrl } from "@r2c/extension/api/repo";
import DomElementLoadedWatcher from "@r2c/extension/content/github/DomElementLoadedWatcher";
import RepoPackageSection from "@r2c/extension/content/PackageCopyBox";
import { R2CLogo } from "@r2c/extension/icons";
import * as React from "react";
import * as ReactDOM from "react-dom";
import Fetch from "react-fetch-component";
import "./RepoHeadsUp.css";

class LoadingHeadsUp extends React.PureComponent {
  public state: UnsupportedMessageState = {
    closed: false
  };

  public render() {
    if (this.state.closed) {
      return null;
    }

    return (
      <div className="r2c-repo-headsup loading-headsup">
        <div className="loading-message">
          <Spinner
            size={Spinner.SIZE_SMALL}
            className="loading-headsup-spinner"
          />
          <span className="loading-message-text">Contacting tower...</span>
        </div>
      </div>
    );
  }
}

type ChecklistItemStates =
  | "danger"
  | "ok"
  | "warn"
  | "neutral";

interface PreflightItemIconProps {
  itemState: ChecklistItemStates;
}

const PreflightItemIcon: React.SFC<PreflightItemIconProps> = (props) => {
  const intent: Intent = {
    "danger": Intent.DANGER,
    "warn": Intent.WARNING,
    "neutral": Intent.NONE,
    "ok": Intent.SUCCESS
  }[props.itemState];

  const icon: IconName = {
    "danger": IconNames.CROSS as IconName,
    "warn": IconNames.WARNING_SIGN as IconName,
    "neutral": IconNames.MINUS as IconName,
    "ok": IconNames.TICK as IconName
  }[props.itemState];

  return (
  <Icon
    className="preflight-checklist-icon"
    intent={intent}
    icon={icon}
  />)
}

const PreflightPermissionsItem: React.SFC = () => (
  <Fetch<PermissionsResponse> url={permissionsUrl()}>
  {({ loading, data, error, response }) => {
    const permissionKeys = data && Object.keys(data.permissions);
    const numPermissions: number = permissionKeys ? permissionKeys.length : 0;
    const itemState: ChecklistItemStates = numPermissions > 0 ? "warn" : "ok";

    return (
      <li className="preflight-checklist-item">
        {loading && (
          <div className="nutrition-section-value loading">
            <NonIdealState icon={<Spinner />} title="Loading..." />
          </div>
        )}
        {permissionKeys && 
          <>
            <PreflightItemIcon itemState={itemState} />
            <span className="preflight-checklist-title">            
              { numPermissions > 0 ? `Permissions detected: ${permissionKeys.join(',')}` : "No special permissions"}
            </span>
          </>
        }
      </li>)
    }
  }
  </Fetch >
)

interface PreflightActivityItemProps {
  activity: Activity
}

const PreflightActivityItem: React.SFC<PreflightActivityItemProps> = (props) => {
    const { archived, is_active, latest_commit_date } = props.activity;
    const itemState: ChecklistItemStates = archived === "true" ? "danger" : is_active === "true" ? "ok" : "warn"

    return (
      <li className="preflight-checklist-item"> 
        <PreflightItemIcon itemState={itemState} />
        <span className="preflight-checklist-title">            
          { archived === "true" ? "archived" : is_active === "true" ? `updated recently (${latest_commit_date})` : `not updated since ${latest_commit_date}`}
        </span>
      </li>)
}

class PreflightChecklist extends React.PureComponent {
  public render() {
    return (
      <Fetch<RepoResponse> url={repoUrl()}>
      {({ loading, data, error, response }) => {
        return (
        <>
          {loading && <LoadingHeadsUp /> }
          {data && 
            <section className="preflight-checklist-container">
              <ul className="preflight-checklist">
                <PreflightPermissionsItem />
                <PreflightActivityItem activity={data.activity} />
                <li className="preflight-checklist-item">
                  <Icon
                    className="preflight-checklist-icon"
                    intent={Intent.SUCCESS}
                    icon={IconNames.TICK}
                  />
                  <span className="preflight-checklist-title">
                    Top 10 popular package
                  </span>
                </li>
                <li className="preflight-checklist-item">
                  <Icon
                    className="preflight-checklist-icon"
                    intent={Intent.SUCCESS}
                    icon={IconNames.TICK}
                  />
                  <span className="preflight-checklist-title">
                    Used by 8 major orgs
                  </span>
                </li>
                <li className="preflight-checklist-item">
                  <Icon
                    className="preflight-checklist-icon"
                    intent={Intent.SUCCESS}
                    icon={IconNames.TICK}
                  />
                  <span className="preflight-checklist-title">
                    Reproducible package
                  </span>
                </li>
                <li className="preflight-checklist-item">
                  <Icon
                    className="preflight-checklist-icon"
                    intent={Intent.SUCCESS}
                    icon={IconNames.TICK}
                  />
                  <span className="preflight-checklist-title">
                    No known vulnerabilities
                  </span>
                </li>      
              </ul>
            </section>
          }
        </>)}
      }
      </Fetch>
    )
  }
}

class ExceptionalHeadsUp extends React.PureComponent {
  public render() {
    return (
      <div className="r2c-repo-headsup exceptional-headsup">
        <header>
          <h1>Danger, Will Robinson!</h1>
        </header>
        <div className="repo-headsup-body">
          <div className="repo-headsup-icon">
            <Icon icon={WARNING_SIGN} iconSize={24} />
          </div>
          <div className="repo-headsup-message">
            <h2>There's a known vulnerability in this package</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse pretium, libero eu varius dignissim, lorem turpis
              maximus dolor, sit amet pharetra enim felis in odio. In hac
              habitasse platea dictumst.
            </p>
            <div className="repo-headsup-message-actions">
              <Button intent={Intent.WARNING}>Show vulnerability info</Button>
              <Button minimal={true}>
                Show me the preflight checks anyways
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

interface UnsupportedMessageState {
  closed: boolean;
}

class UnsupportedHeadsUp extends React.PureComponent<
  {},
  UnsupportedMessageState
> {
  public state: UnsupportedMessageState = {
    closed: false
  };

  public render() {
    if (this.state.closed) {
      return null;
    }

    return (
      <div className="r2c-repo-headsup unsupported-headsup">
        <div className="unsupported-message">
          <span className="unsupported-message-text">
            Preflight coming soon for this language 🛫
          </span>
          <Button
            icon={IconNames.SMALL_CROSS}
            minimal={true}
            onClick={this.closeMessage}
          />
        </div>
      </div>
    );
  }

  private closeMessage: React.MouseEventHandler<HTMLElement> = e => {
    this.setState({ closed: true });
  };
}

class ErrorHeadsUp extends React.PureComponent {
  public state: UnsupportedMessageState = {
    closed: false
  };

  public render() {
    if (this.state.closed) {
      return null;
    }

    return (
      <div className="r2c-repo-headsup error-headsup">
        <div className="error-message">
          <Icon
            icon={IconNames.WARNING_SIGN}
            className="error-icon"
            intent={Intent.DANGER}
          />
          <span className="error-message-text">Couldn't load Preflight</span>
        </div>
      </div>
    );
  }
}

class NormalHeadsUp extends React.PureComponent {
  public render() {
    return (
      <div className="r2c-repo-headsup checklist-headsup">
        <div className="repo-headsup-body">
          <div className="repo-headsup-checklist">
            <PreflightChecklist />
          </div>
          <div className="repo-headsup-actions">
            <RepoPackageSection />
          </div>
        </div>
        <footer>
          <div className="preflight-legend">
            <span className="legend-check legend-entry">
              <Icon icon={IconNames.SMALL_TICK} intent={Intent.SUCCESS} /> Good
            </span>
            <span className="legend-warn legend-entry">
              <Icon
                icon={IconNames.SYMBOL_TRIANGLE_UP}
                intent={Intent.WARNING}
              />{" "}
              Careful
            </span>
            <span className="legend-missing legend-entry">
              <Icon icon={IconNames.MINUS} /> N/A
            </span>
          </div>
          <div className="preflight-logo">
            preflight <R2CLogo />
          </div>
        </footer>
      </div>
    );
  }
}

type HeadsUpStates =
  | "normal"
  | "loading"
  | "unsupported"
  | "error"
  | "exceptional";

interface RepoHeadsUpState {
  debugSelected: HeadsUpStates;
}

class RepoHeadsUp extends React.PureComponent<{}, RepoHeadsUpState> {
  public state: RepoHeadsUpState = {
    debugSelected: "normal"
  };

  public render() {
    const navigation = document.querySelector(".repository-lang-stats-graph");
    const existingElem = document.querySelector(".r2c-repo-headsup-container");

    if (navigation == null) {
      return null;
    }

    if (existingElem != null) {
      existingElem.remove();
    }

    const injected = document.createElement("div");
    injected.classList.add("r2c-repo-headsup-container");
    navigation.after(injected);

    return ReactDOM.createPortal(
      <div className="preflight-container">
        <ButtonGroup minimal={true}>
          <Button
            active={this.state.debugSelected === "normal"}
            onClick={this.toggleSelected("normal")}
          >
            Normal
          </Button>
          <Button
            active={this.state.debugSelected === "loading"}
            onClick={this.toggleSelected("loading")}
          >
            Loading
          </Button>
          <Button
            active={this.state.debugSelected === "unsupported"}
            onClick={this.toggleSelected("unsupported")}
          >
            Unsupported
          </Button>
          <Button
            active={this.state.debugSelected === "error"}
            onClick={this.toggleSelected("error")}
          >
            Error
          </Button>
          <Button
            active={this.state.debugSelected === "exceptional"}
            onClick={this.toggleSelected("exceptional")}
          >
            Exceptional
          </Button>
        </ButtonGroup>
        {this.state.debugSelected === "exceptional" && <ExceptionalHeadsUp />}
        {this.state.debugSelected === "unsupported" && <UnsupportedHeadsUp />}
        {this.state.debugSelected === "loading" && <LoadingHeadsUp />}
        {this.state.debugSelected === "error" && <ErrorHeadsUp />}
        {this.state.debugSelected === "normal" && <NormalHeadsUp />}
      </div>,
      injected
    );
  }

  private toggleSelected = (selected: HeadsUpStates) => (
    e: React.MouseEvent<HTMLElement>
  ) => {
    this.setState({ debugSelected: selected });
  };
}

export default class RepoHeadsUpInjector extends React.PureComponent {
  public render() {
    return (
      <DomElementLoadedWatcher querySelector=".repository-lang-stats-graph">
        {({ done }) => done && <RepoHeadsUp />}
      </DomElementLoadedWatcher>
    );
  }
}
