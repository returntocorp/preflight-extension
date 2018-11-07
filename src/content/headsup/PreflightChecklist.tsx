import { Button, Classes, Icon, IIconProps, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { l } from "@r2c/extension/analytics";
import { ApiFetch } from "@r2c/extension/api/fetch";
import { FindingEntry } from "@r2c/extension/api/findings";
import { PackageEntry } from "@r2c/extension/api/package";
import {
  PermissionsResponse,
  permissionsUrl
} from "@r2c/extension/api/permissions";
import { ScriptEntry } from "@r2c/extension/api/scripts";
import { VulnsResponse, vulnsUrl } from "@r2c/extension/api/vulns";
import {
  PreflightChecklistFetchData,
  PreflightChecklistLoading
} from "@r2c/extension/content/headsup/PreflightFetch";
import * as classnames from "classnames";
import { sumBy } from "lodash";
import * as React from "react";
import { ExtensionContext } from "../index";

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
  loading?: boolean | null;
  onChecklistItemClick: PreflightChecklistItemClickHandler;
}

type PreflightChecklistItemClickHandler = (
  itemType: PreflightChecklistItemType
) => React.MouseEventHandler<HTMLElement>;

interface PreflightChecklistItemProps {
  loading?: boolean | null;
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
    onClick={l(
      `preflight-${itemType}-checklist-item-click`,
      onChecklistItemClick(itemType)
    )}
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
  scripts: ScriptEntry[] | undefined;
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
      loading={props.loading}
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
      loading={props.loading}
    >
      {props.pkg !== null && props.pkg && props.pkg.rank_description
        ? description
        : "Unable to load npm popularity"}
    </PreflightChecklistItem>
  );
};

interface PreflightFindingsItemProps
  extends PreflightChecklistInteractionProps {
  findings: FindingEntry[] | undefined;
}

const PreflightFindingsItem: React.SFC<PreflightFindingsItemProps> = ({
  findings,
  onChecklistItemClick,
  loading
}) => {
  if (loading) {
    return (
      <PreflightChecklistItem
        iconState={"warn"}
        itemType="findings"
        onChecklistItemClick={onChecklistItemClick}
        loading={loading}
      >
        Loading...
      </PreflightChecklistItem>
    );
  } else if (findings == null) {
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
        loading={loading}
      >
        {findings.length} {findings.length === 1 ? "issue" : "issues"} in code
      </PreflightChecklistItem>
    );
  }
};

interface PreflightChecklistProps {
  data: PreflightChecklistFetchData;
  loading: PreflightChecklistLoading;
  onChecklistItemClick: PreflightChecklistItemClickHandler;
}

export class PreflightChecklist extends React.PureComponent<
  PreflightChecklistProps
> {
  public render() {
    const {
      data: { pkg, findings, scripts },
      loading,
      onChecklistItemClick: o
    } = this.props;

    return (
      <section className="preflight-checklist-container">
        <ExtensionContext.Consumer>
          {({ extensionState }) => (
            <ul className="preflight-checklist">
              {extensionState != null &&
                extensionState.experiments.permissions && (
                  <PreflightPermissionsItem onChecklistItemClick={o} />
                )}
              <PreflightScriptsItem
                scripts={
                  scripts != null && scripts.scripts != null
                    ? scripts.scripts
                    : undefined
                }
                onChecklistItemClick={o}
                loading={loading.scripts}
              />
              <PreflightRankItem
                onChecklistItemClick={o}
                pkg={
                  pkg
                    ? pkg.packages.sort(
                        (a, b) => a.package_rank - b.package_rank
                      )[0]
                    : undefined
                }
              />
              <PreflightVulnsItem onChecklistItemClick={o} />
              <PreflightFindingsItem
                onChecklistItemClick={o}
                findings={findings ? findings.findings : undefined}
                loading={loading.findings}
              />
            </ul>
          )}
        </ExtensionContext.Consumer>
      </section>
    );
  }
}
