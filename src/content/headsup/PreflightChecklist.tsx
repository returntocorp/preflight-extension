import { Button, Classes, Icon, IIconProps, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { l } from "@r2c/extension/analytics";
import { FindingEntry } from "@r2c/extension/api/findings";
import { PackageEntry } from "@r2c/extension/api/package";
import { PermissionsFetch } from "@r2c/extension/api/permissions";
import { ScriptEntry } from "@r2c/extension/api/scripts";
import { VulnsFetch } from "@r2c/extension/api/vulns";
import {
  PreflightChecklistFetchData,
  PreflightChecklistLoading
} from "@r2c/extension/content/headsup/PreflightFetch";
import { ExtractedRepoSlug } from "@r2c/extension/utils";
import * as classnames from "classnames";
import { reduce, sumBy } from "lodash";
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
      return {
        intent: Intent.WARNING,
        icon: IconNames.SYMBOL_TRIANGLE_UP,
        color: "#f4d03f"
      };
    case "ok":
      return { intent: Intent.SUCCESS, icon: IconNames.TICK };
    default:
      return { icon: IconNames.MINUS };
  }
}

interface PreflightChecklistInteractionProps {
  repoSlug: ExtractedRepoSlug;
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
      `preflight-checklist-item-${itemType}-click`,
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
  onChecklistItemClick,
  repoSlug
}) => (
  <VulnsFetch repoSlug={repoSlug}>
    {({ loading, data, error }) => {
      // TODO: changing checklist state to always show ok for historical vulns
      // -- eventually want to change once we have non-stale vuln data
      // const itemState: ChecklistItemState =
      //   data && data.vuln.length > 0 ? "warn" : "ok";

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
            iconState="ok"
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
  </VulnsFetch>
);

type PreflightPermissionsItemProps = PreflightChecklistInteractionProps;
const PreflightPermissionsItem: React.SFC<PreflightPermissionsItemProps> = ({
  onChecklistItemClick,
  repoSlug
}) => (
  <PermissionsFetch repoSlug={repoSlug}>
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
        const permissionCount = reduce(
          data.permissions,
          (count, permission) => {
            return permission.found ? count + 1 : count;
          },
          0
        );

        if (permissionCount > 0) {
          return (
            <PreflightChecklistItem
              itemType="permissions"
              onChecklistItemClick={onChecklistItemClick}
              iconState="warn"
            >
              {`Found ${permissionCount} ${
                permissionCount > 1 ? "permissions" : "permission"
              }`}
            </PreflightChecklistItem>
          );
        } else {
          return (
            <PreflightChecklistItem
              itemType="permissions"
              onChecklistItemClick={onChecklistItemClick}
              iconState="ok"
            >
              No permissions found
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
  </PermissionsFetch>
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
  repoSlug: ExtractedRepoSlug;
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
      onChecklistItemClick: o,
      repoSlug
    } = this.props;

    return (
      <section className="preflight-checklist-container">
        <ExtensionContext.Consumer>
          {({ extensionState }) => (
            <ul className="preflight-checklist">
              <PreflightPermissionsItem
                repoSlug={repoSlug}
                onChecklistItemClick={o}
              />
              <PreflightScriptsItem
                repoSlug={repoSlug}
                scripts={
                  scripts != null && scripts.scripts != null
                    ? scripts.scripts
                    : undefined
                }
                onChecklistItemClick={o}
                loading={loading.scripts}
              />
              <PreflightRankItem
                repoSlug={repoSlug}
                onChecklistItemClick={o}
                pkg={
                  pkg
                    ? pkg.packages.sort(
                        (a, b) => a.package_rank - b.package_rank
                      )[0]
                    : undefined
                }
              />
              <PreflightVulnsItem
                repoSlug={repoSlug}
                onChecklistItemClick={o}
              />
              <PreflightFindingsItem
                repoSlug={repoSlug}
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
