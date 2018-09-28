import { Button, Classes, Icon, IIconProps, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { ApiFetch } from "@r2c/extension/api/fetch";
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
import { sumBy } from "lodash";
import * as React from "react";
import TimeAgo from "react-timeago";

export type PreflightChecklistItemType =
  | "permissions"
  | "activity"
  | "scripts"
  | "rank"
  | "vulns"
  | "findings";

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

interface PreflightChecklistInteractionProps {
  onChecklistItemClick(
    itemType: PreflightChecklistItemType
  ): React.MouseEventHandler<HTMLElement>;
}

interface PreflightChecklistItemProps {
  loading?: boolean;
  itemType: PreflightChecklistItemType;
  iconState: ChecklistItemState;
  onChecklistItemClick(
    itemType: PreflightChecklistItemType
  ): React.MouseEventHandler<HTMLElement>;
}

const PreflightChecklistItem: React.SFC<PreflightChecklistItemProps> = ({
  onChecklistItemClick,
  itemType,
  iconState,
  loading,
  children
}) => (
  <Button
    icon={renderIconForState(iconState)}
    className={classnames(
      "preflight-checklist-item",
      `${itemType}-checklist-item`,
      { [Classes.SKELETON]: loading }
    )}
    onClick={onChecklistItemClick(itemType)}
    minimal={true}
    fill={true}
  >
    <span className="preflight-checklist-title">{children}</span>
  </Button>
);

type PreflightVulnsItemProps = PreflightChecklistInteractionProps;
const PreflightVulnsItem: React.SFC<PreflightVulnsItemProps> = ({
  onChecklistItemClick
}) => (
  <ApiFetch<VulnsResponse> url={vulnsUrl()}>
    {({ loading, data, error }) => {
      const itemState: ChecklistItemState =
        data && data.vuln.length > 0 ? "warn" : "ok";

      if (loading != null && loading === true) {
        return (
          <PreflightChecklistItem
            onChecklistItemClick={onChecklistItemClick}
            loading={loading}
            itemType="vulns"
            iconState="neutral"
          >
            Loading vulnerabilities...
          </PreflightChecklistItem>
        );
      } else if (data != null) {
        const vulnCount: number = sumBy(
          data.vuln,
          packageVulns => packageVulns.vuln.length
        );

        return (
          <PreflightChecklistItem
            onChecklistItemClick={onChecklistItemClick}
            itemType="vulns"
            iconState={itemState}
          >
            {data.vuln.length > 0
              ? `Has ${vulnCount} historical ${
                  vulnCount > 1 ? "vulnerabilities" : "vulnerability"
                }`
              : "No known vulnerabilities"}
          </PreflightChecklistItem>
        );
      } else {
        return (
          <PreflightChecklistItem
            onChecklistItemClick={onChecklistItemClick}
            itemType="vulns"
            iconState="neutral"
          >
            Unable to get vulnerability data
          </PreflightChecklistItem>
        );
      }
    }}
  </ApiFetch>
);

type PreflightPermissionsItemProps = PreflightChecklistInteractionProps;
const PreflightPermissionsItem: React.SFC<PreflightPermissionsItemProps> = ({
  onChecklistItemClick
}) => (
  <ApiFetch<PermissionsResponse> url={permissionsUrl()}>
    {({ loading, data }) => {
      if (loading != null && loading === true) {
        return (
          <PreflightChecklistItem
            loading={loading}
            itemType="permissions"
            onChecklistItemClick={onChecklistItemClick}
            iconState="neutral"
          >
            Loading permissions...
          </PreflightChecklistItem>
        );
      } else if (data != null) {
        // N.B. We currently restrict "permissions" to cover only network calls. We will update this
        //      once more permissions land and the data is more comprehensive.
        const networkPermission = data.permissions.network;
        if (networkPermission != null) {
          const networkCallCount = networkPermission.locations.length;
          const itemState: ChecklistItemState = networkPermission.found
            ? "warn"
            : "ok";

          return (
            <PreflightChecklistItem
              itemType="permissions"
              onChecklistItemClick={onChecklistItemClick}
              iconState={itemState}
            >
              {networkPermission.found
                ? `Found ${networkCallCount} network ${
                    networkCallCount > 1 ? "calls" : "call"
                  }`
                : "No network calls detected"}
            </PreflightChecklistItem>
          );
        } else {
          return (
            <PreflightChecklistItem
              onChecklistItemClick={onChecklistItemClick}
              itemType="permissions"
              iconState="neutral"
            >
              Unable to load network call data
            </PreflightChecklistItem>
          );
        }
      } else {
        return (
          <PreflightChecklistItem
            onChecklistItemClick={onChecklistItemClick}
            itemType="permissions"
            iconState="neutral"
          >
            Unable to load code permissions
          </PreflightChecklistItem>
        );
      }
    }}
  </ApiFetch>
);

interface PreflightScriptsItemProps extends PreflightChecklistInteractionProps {
  scripts: ScriptEntry[];
}

const PreflightScriptsItem: React.SFC<PreflightScriptsItemProps> = props => {
  const itemState: ChecklistItemState = props.scripts
    ? props.scripts.length > 0
      ? "warn"
      : "ok"
    : "neutral";

  return (
    <PreflightChecklistItem
      iconState={itemState}
      itemType="scripts"
      onChecklistItemClick={props.onChecklistItemClick}
    >
      {props.scripts != null
        ? props.scripts.length > 0
          ? `Has ${props.scripts.length} npm install ${
              props.scripts.length > 1 ? "hooks" : "hook"
            }`
          : "No npm install hooks"
        : "Unable to load install hook data"}
    </PreflightChecklistItem>
  );
};

interface PreflightRankItemProps extends PreflightChecklistInteractionProps {
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
    <PreflightChecklistItem
      iconState={itemState}
      itemType="rank"
      onChecklistItemClick={props.onChecklistItemClick}
    >
      {props.pkg !== null && props.pkg && props.pkg.rank_description
        ? description
        : "Unable to load npm popularity"}
    </PreflightChecklistItem>
  );
};

interface PreflightActivityItemProps
  extends PreflightChecklistInteractionProps {
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
      <PreflightChecklistItem
        iconState={itemState}
        itemType="scripts"
        onChecklistItemClick={props.onChecklistItemClick}
      >
        {archived ? "Archived project" : "Latest commit "}{" "}
        <TimeAgo date={date} />
      </PreflightChecklistItem>
    );
  } else {
    return (
      <PreflightChecklistItem
        iconState={itemState}
        itemType="scripts"
        onChecklistItemClick={props.onChecklistItemClick}
      >
        Unable to get activity data
      </PreflightChecklistItem>
    );
  }
};

interface PreflightFindingsItemProps
  extends PreflightChecklistInteractionProps {
  findings: FindingEntry[] | undefined;
}

const PreflightFindingsItem: React.SFC<PreflightFindingsItemProps> = ({
  findings,
  onChecklistItemClick
}) => {
  if (findings == null) {
    return (
      <PreflightChecklistItem
        iconState="neutral"
        itemType="findings"
        onChecklistItemClick={onChecklistItemClick}
      >
        Unable to get findings
      </PreflightChecklistItem>
    );
  } else if (findings.length === 0) {
    return (
      <PreflightChecklistItem
        iconState="ok"
        itemType="findings"
        onChecklistItemClick={onChecklistItemClick}
      >
        No issues to report
      </PreflightChecklistItem>
    );
  } else {
    return (
      <PreflightChecklistItem
        iconState={"warn"}
        itemType="findings"
        onChecklistItemClick={onChecklistItemClick}
      >
        {findings.length} {findings.length === 1 ? "issue" : "issues"} in code
      </PreflightChecklistItem>
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
      <ApiFetch<RepoResponse> url={repoUrl()}>
        {repoResponse => (
          <ApiFetch<PackageResponse> url={packageUrl()}>
            {packageResponse => (
              <ApiFetch<FindingsResponse> url={findingsUrl()}>
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
              </ApiFetch>
            )}
          </ApiFetch>
        )}
      </ApiFetch>
    );
  }
}

type PreflightChecklistProps = PreflightChecklistFetchData &
  PreflightChecklistInteractionProps;

export class PreflightChecklist extends React.PureComponent<
  PreflightChecklistProps
> {
  public render() {
    const { repo, pkg, findings, onChecklistItemClick: o } = this.props;

    return (
      <section className="preflight-checklist-container">
        <ul className="preflight-checklist">
          <PreflightPermissionsItem onChecklistItemClick={o} />
          <PreflightActivityItem
            activity={repo.activity}
            onChecklistItemClick={o}
          />
          <PreflightScriptsItem
            scripts={pkg.npmScripts}
            onChecklistItemClick={o}
          />
          <PreflightRankItem
            onChecklistItemClick={o}
            pkg={
              pkg.packages.sort((a, b) => a.package_rank - b.package_rank)[0]
            }
          />
          <PreflightVulnsItem onChecklistItemClick={o} />
          <PreflightFindingsItem
            onChecklistItemClick={o}
            findings={findings.findings}
          />
        </ul>
      </section>
    );
  }
}
