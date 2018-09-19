import { Classes, Icon, IIconProps, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  FindingEntry,
  FindingsResponse,
  findingsUrl
} from "@r2c/extension/api/findings";
import {
  PackageEntry,
  PackageResponse,
  packageUrl,
  ScriptEntry
} from "@r2c/extension/api/package";
import {
  PermissionsResponse,
  permissionsUrl
} from "@r2c/extension/api/permissions";
import { Activity, RepoResponse, repoUrl } from "@r2c/extension/api/repo";
import { VulnsResponse, vulnsUrl } from "@r2c/extension/api/vulns";
import * as classnames from "classnames";
import * as React from "react";
import Fetch from "react-fetch-component";
import TimeAgo from "react-timeago";

type ChecklistItemState = "ok" | "warn" | "neutral";

function renderIconForState(state: ChecklistItemState) {
  const iconProps = getIconPropsForState(state);

  return <Icon {...iconProps} />;
}

function getIconPropsForState(state: ChecklistItemState): IIconProps {
  switch (state) {
    case "warn":
      return { intent: Intent.WARNING, icon: IconNames.SYMBOL_TRIANGLE_UP };
    case "ok":
      return { intent: Intent.SUCCESS, icon: IconNames.TICK };
    default:
      return { icon: IconNames.MINUS };
  }
}

const PreflightVulnsItem: React.SFC = () => (
  <Fetch<VulnsResponse> url={vulnsUrl()}>
    {({ loading, data, error, response }) => {
      const itemState: ChecklistItemState =
        data && data.vuln.length > 0 ? "warn" : "ok";

      return (
        <li
          className={classnames("preflight-checklist-item", {
            [Classes.SKELETON]: loading
          })}
        >
          {loading && (
            <>
              {renderIconForState("neutral")}
              <span className="preflight-checklist-title">
                Loading vulnerabilities...
              </span>
            </>
          )}
          {data && (
            <>
              {renderIconForState(itemState)}
              <span className="preflight-checklist-title">
                {data.vuln.length > 0
                  ? `Has ${data.vuln.length} historical ${
                      data.vuln.length > 1 ? "vulnerabilities" : "vulnerability"
                    }`
                  : "No known vulnerabilities"}
              </span>
            </>
          )}
          {error != null && (
            <li className="preflight-checklist-item">
              {renderIconForState("neutral")}
              <span className="preflight-checklist-title">
                {`Unable to get vulnerability data`}
              </span>
            </li>
          )}
        </li>
      );
    }}
  </Fetch>
);

const PreflightPermissionsItem: React.SFC = () => (
  <Fetch<PermissionsResponse> url={permissionsUrl()}>
    {({ loading, data, error, response }) => {
      const permissionKeys =
        data &&
        Object.keys(data.permissions).filter(
          key => data.permissions[key].found
        );
      const numPermissions: number = permissionKeys ? permissionKeys.length : 0;
      const itemState: ChecklistItemState = numPermissions > 0 ? "warn" : "ok";

      return (
        <li
          className={classnames("preflight-checklist-item", {
            [Classes.SKELETON]: loading
          })}
        >
          {loading && (
            <>
              {renderIconForState("neutral")}
              <span className="preflight-checklist-title">
                Loading permissions...
              </span>
            </>
          )}
          {permissionKeys && (
            <>
              {renderIconForState(itemState)}
              <span className="preflight-checklist-title">
                {numPermissions > 0
                  ? `Permissions detected: ${permissionKeys.join(",")}`
                  : "No permissions"}
              </span>
            </>
          )}
        </li>
      );
    }}
  </Fetch>
);

interface PreflightScriptsItemProps {
  scripts: ScriptEntry[];
}

const PreflightScriptsItem: React.SFC<PreflightScriptsItemProps> = props => {
  const itemState: ChecklistItemState = props.scripts
    ? props.scripts.length > 0
      ? "warn"
      : "ok"
    : "neutral";

  return (
    <li className="preflight-checklist-item">
      {renderIconForState(itemState)}
      <span className="preflight-checklist-title">
        {props.scripts != null
          ? props.scripts.length > 0
            ? `Has ${props.scripts.length} npm install ${
                props.scripts.length > 1 ? "hooks" : "hook"
              }`
            : "No npm install hooks"
          : "Unable to load install hook data"}
      </span>
    </li>
  );
};

interface PreflightRankItemProps {
  pkg: PackageEntry | undefined;
}

const PreflightRankItem: React.SFC<PreflightRankItemProps> = props => {
  const rankThreshold = 10000;
  const itemState: ChecklistItemState =
    props.pkg && props.pkg.package_rank
      ? props.pkg.package_rank > rankThreshold
        ? "warn"
        : "ok"
      : "neutral";

  const description =
    props.pkg &&
    props.pkg.rank_description
      .toLocaleLowerCase()
      .replace("10000", "10k")
      .replace("000", "k");

  return (
    <li className="preflight-checklist-item">
      {renderIconForState(itemState)}
      <span className="preflight-checklist-title">
        {props.pkg !== null && props.pkg && props.pkg.rank_description
          ? description
          : "Unable to load npm popularity"}
      </span>
    </li>
  );
};

interface PreflightActivityItemProps {
  activity: Activity;
}

const PreflightActivityItem: React.SFC<PreflightActivityItemProps> = props => {
  const { archived, latestCommitDate } = props.activity;
  const date = Date.parse(latestCommitDate);
  const timeago = Date.now() - date;
  const itemState: ChecklistItemState =
    archived || timeago / 1000 / 3600 / 24 / 30 > 6 ? "warn" : "ok";

  if (archived !== undefined && latestCommitDate !== undefined) {
    return (
      <li className="preflight-checklist-item">
        {renderIconForState(itemState)}
        <span className="preflight-checklist-title">
          {archived ? "Archived project" : "Latest commit "}{" "}
          <TimeAgo date={date} />
        </span>
      </li>
    );
  } else {
    return (
      <li className="preflight-checklist-item">
        {renderIconForState("neutral")}
        <span className="preflight-checklist-title">
          {`Unable to get activity data`}
        </span>
      </li>
    );
  }
};

interface PreflightFindingsItemProps {
  findings: FindingEntry[] | undefined;
}

const PreflightFindingsItem: React.SFC<PreflightFindingsItemProps> = ({
  findings
}) => {
  if (findings == null) {
    return (
      <li className="preflight-checklist-item">
        {renderIconForState("neutral")}
        <span className="preflight-checklist-title">
          Unable to get findings
        </span>
      </li>
    );
  } else if (findings.length === 0) {
    return (
      <li className="preflight-checklist-item">
        {renderIconForState("ok")}
        <span className="preflight-checklist-title">No issues to report</span>
      </li>
    );
  } else {
    return (
      <li className="preflight-checklist-item">
        {renderIconForState("warn")}
        <span className="preflight-checklist-title">
          {findings.length} {findings.length === 1 ? "issue" : "issues"} in code
        </span>
      </li>
    );
  }
};

interface PreflightChecklistFetchProps {
  children(response: PreflightChecklistFetchResponse): React.ReactNode;
}

interface PreflightChecklistFetchData {
  repo: RepoResponse;
  pkg: PackageResponse;
  findings: FindingsResponse;
}

type PreflightChecklistFetchDataResponse = {
  [K in keyof PreflightChecklistFetchData]: Response
};

interface PreflightChecklistFetchResponse {
  loading: boolean | null;
  error: Error | undefined;
  data: PreflightChecklistFetchData | undefined;
  response: PreflightChecklistFetchDataResponse | undefined;
}

export class PreflightChecklistFetch extends React.PureComponent<
  PreflightChecklistFetchProps
> {
  public render() {
    return (
      <Fetch<RepoResponse> url={repoUrl()}>
        {repoResponse => (
          <Fetch<PackageResponse> url={packageUrl()}>
            {packageResponse => (
              <Fetch<FindingsResponse> url={findingsUrl()}>
                {findingsResponse => {
                  const loading =
                    repoResponse.loading ||
                    packageResponse.loading ||
                    findingsResponse.loading;

                  const error =
                    repoResponse.error ||
                    packageResponse.error ||
                    findingsResponse.error;

                  const data =
                    repoResponse.data != null &&
                    packageResponse.data != null &&
                    findingsResponse.data != null
                      ? {
                          repo: repoResponse.data,
                          pkg: packageResponse.data,
                          findings: findingsResponse.data
                        }
                      : undefined;

                  const response =
                    repoResponse.response != null &&
                    packageResponse.response != null &&
                    findingsResponse.response != null
                      ? {
                          repo: repoResponse.response,
                          pkg: packageResponse.response,
                          findings: findingsResponse.response
                        }
                      : undefined;

                  const fetchResponse: PreflightChecklistFetchResponse = {
                    loading,
                    error,
                    data,
                    response
                  };

                  return this.props.children(fetchResponse);
                }}
              </Fetch>
            )}
          </Fetch>
        )}
      </Fetch>
    );
  }
}

type PreflightChecklistProps = PreflightChecklistFetchData;

export class PreflightChecklist extends React.PureComponent<
  PreflightChecklistProps
> {
  public render() {
    const { repo, pkg, findings } = this.props;

    return (
      <section className="preflight-checklist-container">
        <ul className="preflight-checklist">
          <PreflightPermissionsItem />
          <PreflightActivityItem activity={repo.activity} />
          <PreflightScriptsItem scripts={pkg.npmScripts} />
          <PreflightRankItem
            pkg={
              pkg.packages.sort((a, b) => a.package_rank - b.package_rank)[0]
            }
          />
          <PreflightVulnsItem />
          <PreflightFindingsItem findings={findings.findings} />
        </ul>
      </section>
    );
  }
}
