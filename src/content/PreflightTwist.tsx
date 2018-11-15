import { FindingsFetch } from "@r2c/extension/api/findings";
import { PermissionsFetch } from "@r2c/extension/api/permissions";
import { ScriptsFetch } from "@r2c/extension/api/scripts";
import { VulnsFetch } from "@r2c/extension/api/vulns";
import CollapsibleDetailsSection from "@r2c/extension/content/details/CollapsibleDetailsSection";
import FindingsDetails from "@r2c/extension/content/details/FindingsDetails";
import InstallHooksDetails from "@r2c/extension/content/details/InstallHooksDetails";
import PermissionsDetails from "@r2c/extension/content/details/PermissionsDetails";
import VulnsDetails from "@r2c/extension/content/details/VulnsDetails";
import LastUpdatedBadge from "@r2c/extension/content/LastUpdatedBadge";
import { ExtractedRepoSlug } from "@r2c/extension/utils";
import * as classnames from "classnames";
import { sumBy } from "lodash";
import * as React from "react";
import { RepoFetch } from "../api/repo";
import { PreflightChecklistItemType } from "./headsup/PreflightChecklist";
import { ExtensionContext } from "./index";
import "./PreflightInstallHook.css";
import "./PreflightTwist.css";
import "./PreflightVulnerabilityEntry.css";

interface WrappedDetailsForTypeProps<T> {
  detailsRenderer(data: T): JSX.Element | null;
}

export class WrappedDetailsForType<T> extends React.PureComponent<
  WrappedDetailsForTypeProps<T>
> {}

interface PreflightDetailsSectionProps {
  repoSlug: ExtractedRepoSlug;
  focused: boolean;
  domRef: React.RefObject<HTMLElement> | undefined;
}

export class WrappedPreflightVulnsDetails extends React.PureComponent<
  PreflightDetailsSectionProps
> {
  public render() {
    const { repoSlug, focused, domRef } = this.props;

    return (
      <VulnsFetch repoSlug={repoSlug}>
        {({ data, loading }) => (
          <CollapsibleDetailsSection
            check="vulns"
            title="Vulnerabilities"
            description="Current or historical vulnerabilities discovered in this project."
            startOpen={(data != null && data.vuln.length > 0) || focused}
            count={
              data != null
                ? sumBy(data.vuln, packageVulns => packageVulns.vuln.length)
                : undefined
            }
            loading={loading}
            domRef={domRef}
          >
            {data != null && <VulnsDetails data={data} />}
          </CollapsibleDetailsSection>
        )}
      </VulnsFetch>
    );
  }
}

export class WrappedPreflightPermissionsDetails extends React.PureComponent<
  PreflightDetailsSectionProps
> {
  public render() {
    const { repoSlug, focused, domRef } = this.props;

    return (
      <PermissionsFetch repoSlug={repoSlug}>
        {({ data, loading }) => {
          const numPermissionsFound =
            data != null
              ? Object.keys(data.permissions)
                  .map(key => data.permissions[key].found)
                  .filter(f => f === true).length
              : undefined;

          return (
            <CollapsibleDetailsSection
              check="permissions"
              title="Permissions"
              description="The project's capabilities when it runs. Unexpected capabilities can indicate a security breach or malice."
              startOpen={
                (numPermissionsFound != null && numPermissionsFound > 0) ||
                focused
              }
              count={numPermissionsFound}
              loading={loading}
              domRef={domRef}
            >
              {data != null && <PermissionsDetails data={data} />}
            </CollapsibleDetailsSection>
          );
        }}
      </PermissionsFetch>
    );
  }
}

export class WrappedPreflightFindingsDetails extends React.PureComponent<
  PreflightDetailsSectionProps
> {
  public render() {
    const { repoSlug, focused, domRef } = this.props;

    return (
      <FindingsFetch repoSlug={repoSlug}>
        {({ data, loading, error }) => (
          <CollapsibleDetailsSection
            check="findings"
            title="Findings"
            description="Weaknesses or bad practices that we automatically discovered in this project."
            startOpen={
              (data != null &&
                data.findings != null &&
                data.findings.length > 0) ||
              focused
            }
            count={
              data != null && data.findings != null
                ? data.findings.length
                : undefined
            }
            loading={loading}
            domRef={domRef}
          >
            {data != null && <FindingsDetails data={data} />}
          </CollapsibleDetailsSection>
        )}
      </FindingsFetch>
    );
  }
}

export class WrappedPreflightScriptsDetails extends React.PureComponent<
  PreflightDetailsSectionProps
> {
  public render() {
    const { repoSlug, focused, domRef } = this.props;

    return (
      <ScriptsFetch repoSlug={repoSlug}>
        {({ data, loading }) => (
          <CollapsibleDetailsSection
            check="scripts"
            title="Install hooks"
            description="Hooks can run before or after installing this package, and their presence can indicate a security issue."
            startOpen={
              (data != null &&
                data.scripts != null &&
                data.scripts.length > 0) ||
              focused
            }
            count={
              data != null && data.scripts != null
                ? data.scripts.length
                : undefined
            }
            loading={loading}
            domRef={domRef}
          >
            {data != null && <InstallHooksDetails data={data} />}
          </CollapsibleDetailsSection>
        )}
      </ScriptsFetch>
    );
  }
}

interface PreflightTwistProps {
  repoSlug: ExtractedRepoSlug;
  deepLink: PreflightChecklistItemType | undefined;
}

export default class PreflightTwist extends React.PureComponent<
  PreflightTwistProps
> {
  private twistRefs: {
    [k in PreflightChecklistItemType]: React.RefObject<HTMLElement>
  } = {
    activity: React.createRef<HTMLElement>(),
    findings: React.createRef<HTMLElement>(),
    permissions: React.createRef<HTMLElement>(),
    scripts: React.createRef<HTMLElement>(),
    vulns: React.createRef<HTMLElement>(),
    rank: React.createRef<HTMLElement>()
  };

  public componentDidMount() {
    this.handleDeepLink(this.props.deepLink);
  }

  public componentDidUpdate() {
    this.handleDeepLink(this.props.deepLink);
  }

  public render() {
    const { repoSlug, deepLink } = this.props;

    return (
      <div className={classnames("twist", "preflight-twist")}>
        <RepoFetch repoSlug={repoSlug}>
          {({ data, loading }) => (
            <header className="twist-header">
              <h1 className="twist-title">Manifest</h1>
              {data != null && (
                <LastUpdatedBadge
                  lastUpdatedDate={new Date(data.analyzedAt)}
                  repoSlug={this.props.repoSlug}
                />
              )}
            </header>
          )}
        </RepoFetch>
        <div className="twist-scroll-container">
          <ExtensionContext.Consumer>
            {({ extensionState }) => (
              <div className="twist-body">
                {extensionState != null &&
                  extensionState.experiments.permissions && (
                    <WrappedPreflightPermissionsDetails
                      domRef={this.twistRefs.permissions}
                      focused={deepLink === "permissions"}
                      repoSlug={repoSlug}
                    />
                  )}
                <WrappedPreflightVulnsDetails
                  domRef={this.twistRefs.vulns}
                  focused={deepLink === "vulns"}
                  repoSlug={repoSlug}
                />
                <WrappedPreflightFindingsDetails
                  domRef={this.twistRefs.findings}
                  focused={deepLink === "findings"}
                  repoSlug={repoSlug}
                />
                <WrappedPreflightScriptsDetails
                  domRef={this.twistRefs.scripts}
                  focused={deepLink === "scripts"}
                  repoSlug={repoSlug}
                />
              </div>
            )}
          </ExtensionContext.Consumer>
        </div>
      </div>
    );
  }

  private handleDeepLink = (
    deepLink: PreflightChecklistItemType | undefined
  ): void => {
    if (deepLink == null) {
      return;
    }

    const twistRef = this.twistRefs[deepLink];

    if (twistRef != null && twistRef.current != null) {
      twistRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
}
