import {
  Icon,
  IIconProps,
  Intent,
  NonIdealState,
  Spinner
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
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
import * as React from "react";
import Fetch from "react-fetch-component";

type ChecklistItemState = "danger" | "ok" | "warn" | "neutral";

function renderIconForState(state: ChecklistItemState) {
  const iconProps = getIconPropsForState(state);

  return <Icon {...iconProps} />;
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
      return { icon: IconNames.MINUS };
  }
}

const PreflightVulnsItem: React.SFC = () => (
  <Fetch<VulnsResponse> url={vulnsUrl()}>
    {({ loading, data, error, response }) => {
      const itemState: ChecklistItemState =
        data && data.vuln.length > 0 ? "warn" : "ok";

      return (
        <li className="preflight-checklist-item">
          {loading && (
            <div className="nutrition-section-value loading">
              <NonIdealState icon={<Spinner />} title="Loading..." />
            </div>
          )}
          {data && (
            <>
              {renderIconForState(itemState)}
              <span className="preflight-checklist-title">
                {data.vuln.length > 0
                  ? `Historical vulnerabilities: ${data.vuln.length}`
                  : "No historical vulnerabilities"}
              </span>
            </>
          )}
        </li>
      );
    }}
  </Fetch>
);

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
          {permissionKeys && (
            <>
              {renderIconForState(itemState)}
              <span className="preflight-checklist-title">
                {numPermissions > 0
                  ? `Permissions detected: ${permissionKeys.join(",")}`
                  : "No special permissions"}
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
  const itemState: ChecklistItemState =
    props.scripts.length > 0 ? "warn" : "ok";

  return (
    <li className="preflight-checklist-item">
      {renderIconForState(itemState)}
      <span className="preflight-checklist-title">
        {props.scripts.length > 0
          ? `${props.scripts.length} npm install hooks detected`
          : "no npm install hooks"}
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
      ? props.pkg.package_rank >= rankThreshold
        ? "warn"
        : "ok"
      : "neutral";

  return (
    <li className="preflight-checklist-item">
      {renderIconForState(itemState)}
      <span className="preflight-checklist-title">
        {props.pkg &&
          `${props.pkg.rank_description || "NPM rank"}: ${
            props.pkg.package_rank
              ? props.pkg.package_rank >= rankThreshold
                ? "Not many people use this package"
                : "Widely used"
              : "Invalid data"
          }`}
      </span>
    </li>
  );
};

interface PreflightActivityItemProps {
  activity: Activity;
}

const PreflightActivityItem: React.SFC<PreflightActivityItemProps> = props => {
  const { archived, isActive, latestCommitDate } = props.activity;
  const itemState: ChecklistItemState = archived
    ? "danger"
    : isActive
      ? "ok"
      : "warn";

  if (
    archived !== undefined &&
    isActive !== undefined &&
    latestCommitDate !== undefined
  ) {
    return (
      <li className="preflight-checklist-item">
        {renderIconForState(itemState)}
        <span className="preflight-checklist-title">
          {archived
            ? "archived"
            : isActive
              ? `updated recently (${latestCommitDate})`
              : `not updated since ${latestCommitDate}`}
        </span>
      </li>
    );
  } else {
    return (
      <li className="preflight-checklist-item">
        {renderIconForState("neutral")}
        <span className="preflight-checklist-title">
          {`Repo activity: Invalid data`}
        </span>
      </li>
    );
  }
};

interface PreflightChecklistFetchProps {
  children(response: PreflightChecklistFetchResponse): React.ReactNode;
}

interface PreflightChecklistFetchResponse {
  loading: boolean | null;
  error: Error | undefined;
  data: { repo: RepoResponse; pkg: PackageResponse } | undefined;
}

class PreflightChecklistFetch extends React.PureComponent<
  PreflightChecklistFetchProps
> {
  public render() {
    return (
      <Fetch<RepoResponse> url={repoUrl()}>
        {repoResponse => (
          <Fetch<PackageResponse> url={packageUrl()}>
            {packageResponse => {
              const loading = repoResponse.loading || packageResponse.loading;
              const error = repoResponse.error || packageResponse.error;
              const data =
                repoResponse.data != null && packageResponse.data != null
                  ? { repo: repoResponse.data, pkg: packageResponse.data }
                  : undefined;

              return this.props.children({ loading, error, data });
            }}
          </Fetch>
        )}
      </Fetch>
    );
  }
}

export class PreflightChecklist extends React.PureComponent {
  public render() {
    return (
      <PreflightChecklistFetch>
        {({ loading, error, data }) => (
          <>
            {data && (
              <section className="preflight-checklist-container">
                <ul className="preflight-checklist">
                  <PreflightPermissionsItem />
                  <PreflightActivityItem activity={data.repo.activity} />
                  <PreflightScriptsItem scripts={data.pkg.npmScripts} />
                  <PreflightRankItem
                    pkg={
                      data.pkg.packages.sort(
                        (a, b) => a.package_rank - b.package_rank
                      )[0]
                    }
                  />
                  <PreflightVulnsItem />
                </ul>
              </section>
            )}
          </>
        )}
      </PreflightChecklistFetch>
    );
  }
}
