import { Button, Spinner, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { ApiFetch } from "@r2c/extension/api/fetch";
import { FindingsResponse, findingsUrl } from "@r2c/extension/api/findings";
import {
  PermissionsResponse,
  permissionsUrl
} from "@r2c/extension/api/permissions";
import {
  ScriptEntry,
  ScriptsResponse,
  scriptsUrl
} from "@r2c/extension/api/scripts";
import {
  VulnerabilityEntry,
  VulnsResponse,
  vulnsUrl
} from "@r2c/extension/api/vulns";
import FindingsGroupedList from "@r2c/extension/content/FindingsGroupedList";
import LastUpdatedBadge from "@r2c/extension/content/LastUpdatedBadge";
import { ExtractedRepoSlug } from "@r2c/extension/utils";
import * as classnames from "classnames";
import { sumBy } from "lodash";
import * as React from "react";
import * as Markdown from "react-markdown";
import TimeAgo from "react-timeago";
import { RepoResponse, repoUrl } from "../api/repo";
import { PreflightChecklistItemType } from "./headsup/PreflightChecklist";
import { ExtensionContext } from "./index";
import "./PreflightInstallHook.css";
import "./PreflightTwist.css";
import "./PreflightVulnerabilityEntry.css";

interface PreflightVulnerabilityEntryProps {
  vuln: VulnerabilityEntry;
}

interface PreflightVulnerabilityEntryState {
  showMore: boolean;
}

class PreflightVulnerabilityEntry extends React.PureComponent<
  PreflightVulnerabilityEntryProps,
  PreflightVulnerabilityEntryState
> {
  public state: PreflightVulnerabilityEntryState = {
    showMore: false
  };

  public render() {
    const { vuln } = this.props;
    const { showMore } = this.state;

    return (
      <article className="preflight-vulnerability-entry">
        <header>
          <div className="vuln-cves">
            {vuln.cves.length > 0 ? (
              vuln.cves.map(cve => (
                <div className="vuln-cve" key={cve}>
                  {cve}
                </div>
              ))
            ) : (
              <span className="no-vuln-cve">No CVE assigned</span>
            )}
          </div>
          <h2 className="vuln-title">{vuln.title}</h2>
          <div className="vuln-versions">
            <span className="vuln-affected">
              Vulnerable{" "}
              <span className="vuln-version">{vuln.vulnerable_versions}</span>
            </span>
            <span className="vuln-patched">
              Patched{" "}
              <span className="vuln-version">{vuln.patched_versions}</span>
            </span>
          </div>
          <div className="vuln-metadata">
            Found{" "}
            <span className="vuln-published">
              <TimeAgo date={new Date(vuln.publish_date)} />
            </span>{" "}
            by <span className="vuln-author">{vuln.author}</span>
          </div>
        </header>
        {showMore && (
          <div
            className={classnames("vuln-body", {
              visible: showMore,
              hidden: !showMore
            })}
          >
            <section className="vuln-overview">
              <header>Overview</header>
              <Markdown source={vuln.overview} />
            </section>
            <section className="vuln-recommendations">
              <header>Recommendations</header>
              <Markdown source={vuln.recommendation} />
            </section>
            <section className="vuln-references">
              <header>References</header>
              <Markdown source={vuln.references} />
            </section>
            <section className="vuln-errata">
              <header>Errata</header>
              <dl>
                <dt>CVSS Vector</dt>
                <dd>{vuln.cvss_vector}</dd>
                <dt>CVSS Score</dt>
                <dd>{vuln.cvss_score}</dd>
              </dl>
            </section>
          </div>
        )}
        <Button
          className="vuln-show-more-button"
          minimal={true}
          fill={true}
          onClick={this.handleToggleShowMore}
        >
          Show {showMore ? "less" : "more"}
        </Button>
      </article>
    );
  }

  private handleToggleShowMore: React.MouseEventHandler<HTMLElement> = e =>
    this.setState({ showMore: !this.state.showMore });
}

interface PreflightInstallHookProps {
  script: ScriptEntry;
}

class PreflightInstallHook extends React.PureComponent<
  PreflightInstallHookProps
> {
  public render() {
    const { script } = this.props;

    return (
      <article className="install-hook">
        <header className="install-hook-type">{script.type}</header>
        <div className="install-hook-script">
          <pre>{script.script}</pre>
        </div>
      </article>
    );
  }
}

interface PreflightSectionProps {
  check: PreflightChecklistItemType;
  title: string;
  count?: number;
  description?: string;
  loading?: boolean | null;
  startOpen?: boolean;
  domRef?: React.RefObject<HTMLElement>;
}

interface PreflightSectionState {
  open: boolean | undefined;
}

class PreflightSection extends React.PureComponent<
  PreflightSectionProps,
  PreflightSectionState
> {
  public state: PreflightSectionState = {
    open: undefined
  };

  public componentDidUpdate(prevProps: PreflightSectionProps) {
    if (
      this.props.startOpen != null &&
      this.props.startOpen &&
      this.state.open == null
    ) {
      this.setState({ open: true });
    }
  }

  public render() {
    const {
      check,
      title,
      description,
      count,
      children,
      loading,
      domRef
    } = this.props;
    const { open } = this.state;

    return (
      <section
        className={classnames("preflight-section", `preflight-${check}`)}
        ref={domRef}
      >
        <Button
          className={classnames("preflight-section-header")}
          minimal={true}
          fill={true}
          onClick={this.toggleCollapse}
          rightIcon={open ? IconNames.CHEVRON_UP : IconNames.CHEVRON_DOWN}
        >
          <span className="preflight-section-header-text">
            <span className="preflight-section-title">{title}</span>
            {!loading && (
              <Tag
                className="preflight-section-header-count"
                minimal={count == null || count === 0}
                round={true}
              >
                {count || 0}
              </Tag>
            )}
            {loading && <Spinner size={Spinner.SIZE_SMALL} />}
          </span>
        </Button>
        {!loading &&
          open != null &&
          open && (
            <div className="preflight-section-body">
              <p className="preflight-section-description">{description}</p>
              <div className="preflight-section-content">{children}</div>
            </div>
          )}
      </section>
    );
  }

  private toggleCollapse: React.MouseEventHandler<HTMLElement> = e =>
    this.setState({ open: !this.state.open });
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
        <ApiFetch<RepoResponse> url={repoUrl(repoSlug)}>
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
        </ApiFetch>
        <div className="twist-scroll-container">
          <ExtensionContext.Consumer>
            {({ extensionState }) => (
              <div className="twist-body">
                {extensionState != null &&
                  extensionState.experiments.permissions && (
                    <ApiFetch<PermissionsResponse>
                      url={permissionsUrl(repoSlug)}
                    >
                      {({ data, loading }) => {
                        const numPermissionsFound =
                          data != null
                            ? Object.keys(data.permissions)
                                .map(key => data.permissions[key].found)
                                .filter(f => f === true).length
                            : undefined;

                        return (
                          <PreflightSection
                            check="permissions"
                            title="Permissions"
                            description="The project's capabilities when it runs. Unexpected capabilities can indicate a security breach or malice."
                            startOpen={
                              (numPermissionsFound != null &&
                                numPermissionsFound > 0) ||
                              deepLink === "permissions"
                            }
                            count={numPermissionsFound}
                            loading={loading}
                            domRef={this.twistRefs.permissions}
                          >
                            {data != null &&
                              data.permissions != null && (
                                <>
                                  {Object.keys(data.permissions).map(
                                    key =>
                                      data.permissions[key].found && (
                                        <div
                                          className="permission-entry"
                                          key={key}
                                        >
                                          <span className="permission-entry-name">
                                            {data.permissions[key].displayName}
                                          </span>
                                          <FindingsGroupedList
                                            commitHash={data.commitHash}
                                            findings={
                                              data.permissions[key].locations
                                            }
                                            repoSlug={repoSlug}
                                          />
                                        </div>
                                      )
                                  )}
                                </>
                              )}
                          </PreflightSection>
                        );
                      }}
                    </ApiFetch>
                  )}
                <ApiFetch<VulnsResponse> url={vulnsUrl(repoSlug)}>
                  {({ data, loading }) => (
                    <PreflightSection
                      check="vulns"
                      title="Vulnerabilities"
                      description="Current or historical vulnerabilities discovered in this project."
                      startOpen={
                        (data != null && data.vuln.length > 0) ||
                        deepLink === "vulns"
                      }
                      count={
                        data != null
                          ? sumBy(
                              data.vuln,
                              packageVulns => packageVulns.vuln.length
                            )
                          : undefined
                      }
                      loading={loading}
                      domRef={this.twistRefs.vulns}
                    >
                      {data != null &&
                        data.vuln.map(
                          (vulns, entriesIdx) =>
                            vulns != null &&
                            vulns.vuln.map(vuln => (
                              <PreflightVulnerabilityEntry
                                vuln={vuln}
                                key={vuln.slug}
                              />
                            ))
                        )}
                    </PreflightSection>
                  )}
                </ApiFetch>
                <ApiFetch<FindingsResponse> url={findingsUrl(repoSlug)}>
                  {({ data, loading, error }) => (
                    <PreflightSection
                      check="findings"
                      title="Findings"
                      description="Weaknesses or bad practices that we automatically discovered in this project."
                      startOpen={
                        (data != null &&
                          data.findings != null &&
                          data.findings.length > 0) ||
                        deepLink === "findings"
                      }
                      count={
                        data != null && data.findings != null
                          ? data.findings.length
                          : undefined
                      }
                      loading={loading}
                      domRef={this.twistRefs.findings}
                    >
                      {data != null &&
                        data.findings != null && (
                          <FindingsGroupedList
                            commitHash={data.commitHash}
                            findings={data.findings}
                            repoSlug={repoSlug}
                          />
                        )}
                    </PreflightSection>
                  )}
                </ApiFetch>
                <ApiFetch<ScriptsResponse> url={scriptsUrl(repoSlug)}>
                  {({ data, loading }) => (
                    <PreflightSection
                      check="scripts"
                      title="Install hooks"
                      description="Hooks can run before or after installing this package, and their presence can indicate a security issue."
                      startOpen={
                        (data != null &&
                          data.scripts != null &&
                          data.scripts.length > 0) ||
                        deepLink === "scripts"
                      }
                      count={
                        data != null && data.scripts != null
                          ? data.scripts.length
                          : undefined
                      }
                      loading={loading}
                      domRef={this.twistRefs.scripts}
                    >
                      {data &&
                        data.scripts != null && (
                          <div className="install-hooks">
                            {data.scripts.map((script, i) => (
                              <PreflightInstallHook
                                script={script}
                                key={`${script.type}_${i}`}
                              />
                            ))}
                          </div>
                        )}
                    </PreflightSection>
                  )}
                </ApiFetch>
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
