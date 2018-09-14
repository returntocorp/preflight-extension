import { PackageResponse, packageUrl } from "@r2c/extension/api/package";
import {
  PermissionsResponse,
  permissionsUrl
} from "@r2c/extension/api/permissions";
import { RepoResponse, repoUrl } from "@r2c/extension/api/repo";
import { VulnsResponse, vulnsUrl } from "@r2c/extension/api/vulns";
import { buildFindingFileLink, ExtractedRepoSlug } from "@r2c/extension/utils";
import * as classnames from "classnames";
import * as React from "react";
import Fetch from "react-fetch-component";
import "./PreflightTwist.css";

type PreflightCheck =
  | "permissions"
  | "activity"
  | "scripts"
  | "npm-rank"
  | "vulns";

interface PreflightSectionProps {
  check: PreflightCheck;
  title: string;
  description?: string;
}

class PreflightSection extends React.PureComponent<PreflightSectionProps> {
  public render() {
    const { check, title, description, children } = this.props;

    return (
      <section
        className={classnames("preflight-section", `preflight-${check}`)}
      >
        <header>
          <span className="preflight-section-title">{title}</span>
          <p className="preflight-section-description">{description}</p>
        </header>
        <div className="preflight-section-body">{children}</div>
      </section>
    );
  }
}

interface PreflightTwistProps {
  repoSlug: ExtractedRepoSlug;
}

export default class PreflightTwist extends React.PureComponent<
  PreflightTwistProps
> {
  public render() {
    const { repoSlug } = this.props;

    return (
      <div className={classnames("twist", "preflight-twist")}>
        <header className="twist-header">
          <h1 className="twist-title">Manifest</h1>
        </header>
        <div className="twist-body">
          <Fetch<PermissionsResponse> url={permissionsUrl()}>
            {({ data }) => (
              <PreflightSection
                check="permissions"
                title="Permissions"
                description="The project's capabilities when it runs. Unexpected capabilities can indicate a security breach or malice."
              >
                {data &&
                  data.permissions != null && (
                    <>
                      {Object.keys(data.permissions).map(key => (
                        <div className="permission-entry" key={key}>
                          <span className="permission-entry-name">
                            {data.permissions[key].displayName}
                          </span>
                          {data.permissions[key].locations.map(location => (
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
                          ))}
                        </div>
                      ))}
                    </>
                  )}
              </PreflightSection>
            )}
          </Fetch>
          <Fetch<RepoResponse> url={repoUrl()}>
            {({ data }) => (
              <PreflightSection
                check="activity"
                title="Commit activity"
                description="How long ago someone contributed to the repo. Using an inactive repo can be riskier than using a maintained one."
              >
                {data && (
                  <>
                    <div className="last-committed">
                      <span className="last-committed-message">
                        Last committed:{" "}
                      </span>
                      <span className="last-committed-date">
                        {data.activity.latestCommitDate}
                      </span>
                    </div>
                  </>
                )}
              </PreflightSection>
            )}
          </Fetch>
          <Fetch<PackageResponse> url={packageUrl()}>
            {({ data }) => (
              <>
                <PreflightSection
                  check="scripts"
                  title="Install hooks"
                  description="Hooks can run before or after installing this package, and their presence can indicate a security issue."
                />
                <PreflightSection
                  check="npm-rank"
                  title="npm ranking"
                  description="The popularity of this package on npm. More widely used packages may have less risk since more people have looked at them."
                />
              </>
            )}
          </Fetch>
          <Fetch<VulnsResponse> url={vulnsUrl()}>
            {({ data }) => (
              <PreflightSection
                check="vulns"
                title="Vulnerabilities"
                description="Current or historical vulnerabilities discovered in this project."
              />
            )}
          </Fetch>
        </div>
      </div>
    );
  }
}
