import { Button, Classes, Spinner, Tag } from "@blueprintjs/core";
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
import { VulnsResponse, vulnsUrl } from "@r2c/extension/api/vulns";
import FindingsGroupedList from "@r2c/extension/content/FindingsGroupedList";
import { buildFindingFileLink, ExtractedRepoSlug } from "@r2c/extension/utils";
import * as classnames from "classnames";
import * as React from "react";
import Fetch from "react-fetch-component";
import { PreflightChecklistItemType } from "./headsup/PreflightChecklist";
import "./PreflightTwist.css";

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
      startOpen,
      domRef
    } = this.props;
    const { open } = this.state;

    return (
      <section
        className={classnames("preflight-section", `preflight-${check}`)}
        ref={domRef}
      >
        <Button
          className={classnames("preflight-section-header", Classes.FILL)}
          minimal={true}
          onClick={this.toggleCollapse}
          rightIcon={open ? IconNames.CHEVRON_UP : IconNames.CHEVRON_DOWN}
        >
          <span className="preflight-section-header-text">
            <span className="preflight-section-title">{title}</span>
            {!loading &&
              count != null && (
                <Tag
                  className="preflight-section-header-count"
                  minimal={!startOpen}
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
    const { repoSlug } = this.props;

    return (
      <div className={classnames("twist", "preflight-twist")}>
        <header className="twist-header">
          <h1 className="twist-title">Manifest</h1>
        </header>
        <div className="twist-body">
          <Fetch<PermissionsResponse> url={permissionsUrl()}>
            {({ data, loading }) => (
              <PreflightSection
                check="permissions"
                title="Permissions"
                description="The project's capabilities when it runs. Unexpected capabilities can indicate a security breach or malice."
                startOpen={
                  data != null &&
                  data.permissions != null &&
                  Object.keys(data.permissions)
                    .map(key => data.permissions[key].found)
                    .some(f => f === true)
                }
                count={
                  data != null
                    ? Object.keys(data.permissions)
                        .map(key => data.permissions[key].found)
                        .filter(f => f === true).length
                    : undefined
                }
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
                                      {location.file_name}:{location.start_line}
                                    </a>
                                  )
                              )}
                            </div>
                          )
                      )}
                    </>
                  )}
              </PreflightSection>
            )}
          </Fetch>
          <Fetch<VulnsResponse> url={vulnsUrl()}>
            {({ data, loading }) => (
              <PreflightSection
                check="vulns"
                title="Vulnerabilities"
                description="Current or historical vulnerabilities discovered in this project."
                startOpen={data != null && data.vuln.length > 0}
                count={data != null ? data.vuln.length : undefined}
                loading={loading}
                domRef={this.twistRefs.vulns}
              >
                {data != null &&
                  data.vuln.map((vuln, i) => (
                    <div className="vulns-raw" key={i}>
                      <pre>{JSON.stringify(vuln, undefined, 2)}</pre>
                    </div>
                  ))}
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
                  data != null &&
                  data.findings != null &&
                  data.findings.length > 0
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
                  startOpen={data != null && data.npmScripts.length > 0}
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
                startOpen={data != null && data.activity != null}
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
