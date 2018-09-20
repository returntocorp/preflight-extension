import { Button, Spinner, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  FindingsResponse,
  findingsUrlFromSlug
} from "@r2c/extension/api/findings";
import { PackageResponse, packageUrl } from "@r2c/extension/api/package";
import {
  PermissionsResponse,
  permissionsUrl
} from "@r2c/extension/api/permissions";
import { RepoResponse, repoUrl } from "@r2c/extension/api/repo";
import {
  VulnerabilityEntry,
  VulnsResponse,
  vulnsUrl
} from "@r2c/extension/api/vulns";
import FindingsGroupedList from "@r2c/extension/content/FindingsGroupedList";
import { buildFindingFileLink, ExtractedRepoSlug } from "@r2c/extension/utils";
import * as classnames from "classnames";
import * as React from "react";
import Fetch from "react-fetch-component";
import * as Markdown from "react-markdown";
import TimeAgo from "react-timeago";
import { PreflightChecklistItemType } from "./headsup/PreflightChecklist";
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
    if (this.props.startOpen != null && this.props.startOpen) {
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
            {!loading &&
              count != null && (
                <Tag
                  className="preflight-section-header-count"
                  minimal={count > 0}
                  round={true}
                >
                  {count}
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
        <header className="twist-header">
          <h1 className="twist-title">Manifest</h1>
        </header>
        <div className="twist-scroll-container">
          <div className="twist-body">
            <Fetch<PermissionsResponse> url={permissionsUrl()}>
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
                                <div className="permission-entry" key={key}>
                                  <span className="permission-entry-name">
                                    {data.permissions[key].displayName}
                                  </span>
                                  {data.permissions[key].locations.map(
                                    location =>
                                      location.file_name != null &&
                                      location.start_line != null && (
                                        <a
                                          href={buildFindingFileLink(
                                            repoSlug,
                                            data.commitHash,
                                            location.file_name,
                                            location.start_line
                                          )}
                                        >
                                          {location.file_name}:
                                          {location.start_line}
                                        </a>
                                      )
                                  )}
                                </div>
                              )
                          )}
                        </>
                      )}
                  </PreflightSection>
                );
              }}
            </Fetch>
            <Fetch<VulnsResponse> url={vulnsUrl()}>
              {({ data, loading }) => (
                <PreflightSection
                  check="vulns"
                  title="Vulnerabilities"
                  description="Current or historical vulnerabilities discovered in this project."
                  startOpen={
                    (data != null && data.vuln.length > 0) ||
                    deepLink === "vulns"
                  }
                  count={data != null ? data.vuln.length : undefined}
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
            </Fetch>
            <Fetch<FindingsResponse> url={findingsUrlFromSlug(repoSlug)}>
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
            </Fetch>
            <Fetch<PackageResponse> url={packageUrl()}>
              {({ data, loading }) => (
                <>
                  <PreflightSection
                    check="scripts"
                    title="Install hooks"
                    description="Hooks can run before or after installing this package, and their presence can indicate a security issue."
                    startOpen={
                      (data != null && data.npmScripts.length > 0) ||
                      deepLink === "scripts"
                    }
                    count={data != null ? data.npmScripts.length : undefined}
                    loading={loading}
                    domRef={this.twistRefs.scripts}
                  >
                    {data && (
                      <div className="install-hook">
                        {data.npmScripts.map((script, i) => (
                          <div key={`${script.type}_${i}`} className="hook">
                            <span className="install-hook-type">
                              {script.type}
                            </span>{" "}
                            <div className="install-hook-script">
                              <pre>{script.script}</pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </PreflightSection>
                </>
              )}
            </Fetch>
            <Fetch<RepoResponse> url={repoUrl()}>
              {({ data, loading }) => (
                <PreflightSection
                  check="activity"
                  title="Commit activity"
                  description="How long ago someone contributed to the repo. Using an inactive repo can be riskier than using a maintained one."
                  startOpen={
                    (data != null && data.activity != null) ||
                    deepLink === "activity"
                  }
                  loading={loading}
                  domRef={this.twistRefs.activity}
                >
                  {data && (
                    <div className="last-committed">
                      <span className="last-committed-message">
                        Last committed:{" "}
                      </span>
                      <span className="last-committed-date">
                        {data.activity.latestCommitDate}
                      </span>
                    </div>
                  )}
                </PreflightSection>
              )}
            </Fetch>
          </div>
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
