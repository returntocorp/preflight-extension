
import { Button, ButtonGroup, Icon, IIconProps, Intent, NonIdealState, Spinner } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { WARNING_SIGN } from "@blueprintjs/icons/lib/esm/generated/iconNames";
import { PackageEntry, PackageResponse, packageUrl, ScriptEntry } from "@r2c/extension/api/package";
import { PermissionsResponse, permissionsUrl } from "@r2c/extension/api/permissions";
import { Activity, RepoResponse, repoUrl } from "@r2c/extension/api/repo";
import { VulnsResponse, vulnsUrl } from "@r2c/extension/api/vulns";
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

type ChecklistItemState = "danger" | "ok" | "warn" | "neutral";

function renderIconForState(state: ChecklistItemState) {
  const iconProps = getIconPropsForState(state);
  
  return <Icon {...iconProps} />
}

function getIconPropsForState(state: ChecklistItemState): IIconProps {
  switch (state) {
    case "danger":
      return { intent: Intent.DANGER, icon: IconNames.CROSS };
    case "warn":
      return { intent: Intent.WARNING, icon: IconNames.SYMBOL_TRIANGLE_UP };
    case "ok":
      return { intent: Intent.SUCCESS, icon: IconNames.TICK };
    default:
      return { icon: IconNames.MINUS }
  }
}

const PreflightVulnsItem: React.SFC = () => (
  <Fetch<VulnsResponse> url={vulnsUrl()}>
  {({ loading, data, error, response }) => {
    const itemState: ChecklistItemState = data && data.vuln.length > 0 ? "warn" : "ok";

    return (
      <li className="preflight-checklist-item">
        {loading && (
          <div className="nutrition-section-value loading">
            <NonIdealState icon={<Spinner />} title="Loading..." />
          </div>
        )}
        {data && 
          <>
            {renderIconForState(itemState)}
            <span className="preflight-checklist-title">            
              { data.vuln.length > 0 ? `Historical vulnerabilities: ${data.vuln.length}` : "No historical vulnerabilities"}
            </span>
          </>
        }
      </li>)
    }
  }
  </Fetch >
)

const PreflightPermissionsItem: React.SFC = () => (
  <Fetch<PermissionsResponse> url={permissionsUrl()}>
  {({ loading, data, error, response }) => {
    const permissionKeys = data && Object.keys(data.permissions);
    const numPermissions: number = permissionKeys ? permissionKeys.length : 0;
    const itemState: ChecklistItemState = numPermissions > 0 ? "warn" : "ok";

    return (
      <li className="preflight-checklist-item">
        {loading && (
          <div className="nutrition-section-value loading">
            <NonIdealState icon={<Spinner />} title="Loading..." />
          </div>
        )}
        {permissionKeys && 
          <>
            {renderIconForState(itemState)}
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

interface PreflightScriptsItemProps {
  scripts: ScriptEntry[];
}

const PreflightScriptsItem: React.SFC<PreflightScriptsItemProps> = (props) => {
    const itemState: ChecklistItemState = props.scripts.length > 0 ? "warn" : "ok";

    return (
      <li className="preflight-checklist-item"> 
        {renderIconForState(itemState)}
        <span className="preflight-checklist-title">
          { props.scripts.length > 0 ? `${props.scripts.length} npm install hooks detected` : "no npm install hooks" }
        </span>
      </li>)
}

interface PreflightRankItemProps {
  pkg: PackageEntry | undefined;
}

const PreflightRankItem: React.SFC<PreflightRankItemProps> = (props) => {
    const itemState: ChecklistItemState = (props.pkg && props.pkg.package_rank) ? props.pkg.package_rank >= 500 ? "warn" : "ok" : "neutral";

    return (
      <li className="preflight-checklist-item"> 
        {renderIconForState(itemState)}
        <span className="preflight-checklist-title">
          {props.pkg && 
            `${props.pkg.rank_description || "NPM rank"}: ${props.pkg.package_rank ? props.pkg.package_rank >= 500 ? "Not many people use this package" : "Widely used": "Invalid data"}` 
          }
        </span>
      </li>)
}

interface PreflightActivityItemProps {
  activity: Activity
}

const PreflightActivityItem: React.SFC<PreflightActivityItemProps> = (props) => {
    const { archived, is_active, latest_commit_date } = props.activity;
    const itemState: ChecklistItemState = archived === "true" ? "danger" : is_active === "true" ? "ok" : "warn"

    return (
      <li className="preflight-checklist-item"> 
        {renderIconForState(itemState)}
        <span className="preflight-checklist-title">            
          { archived === "true" ? "archived" : is_active === "true" ? `updated recently (${latest_commit_date})` : `not updated since ${latest_commit_date}`}
        </span>
      </li>)
}

interface PreflightChecklistFetchProps {
  children(response: PreflightChecklistFetchResponse): React.ReactNode;
}

interface PreflightChecklistFetchResponse {
  loading: boolean | null;
  error: Error | undefined;
  data: { repo: RepoResponse; pkg: PackageResponse } | undefined;
}

class PreflightChecklistFetch extends React.PureComponent<PreflightChecklistFetchProps> {
  public render() {
    return (
      <Fetch<RepoResponse> url={repoUrl()}>
      {(repoResponse) => 
          <Fetch<PackageResponse> url={packageUrl()}>
          {(packageResponse) => {
            const loading = repoResponse.loading || packageResponse.loading;
            const error = repoResponse.error || packageResponse.error;
            const data = repoResponse.data != null && packageResponse.data != null ? { repo: repoResponse.data, pkg: packageResponse.data } : undefined;
            
            return this.props.children({ loading, error, data })
          }}
          </Fetch>
      }
      </Fetch>    
    )
  }
}

class PreflightChecklist extends React.PureComponent {
  public render() {
    return (
      <PreflightChecklistFetch>
        {({ loading, error, data }) => (
          <>
            {loading && <LoadingHeadsUp /> }
            {data &&
              <section className="preflight-checklist-container">
                <ul className="preflight-checklist">
                  <PreflightPermissionsItem />
                  <PreflightActivityItem activity={data.repo.activity} />
                  <PreflightScriptsItem scripts={data.pkg.npmScripts}/>
                  <PreflightRankItem pkg={data.pkg.packages.sort((a, b) => a.package_rank - b.package_rank)[0]}/> 
                  <PreflightVulnsItem />
                </ul>
              </section>
            }
          </>)}
          </PreflightChecklistFetch>
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
