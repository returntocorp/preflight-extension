import { buildFetchComponent } from "@r2c/extension/api/fetch";
import { ExtractedRepoSlug, getApiRootHostname } from "@r2c/extension/utils";
import { FindingEntry } from "./findings";

export function permissionsUrl(repoSlug: ExtractedRepoSlug) {
  const { domain, org, repo } = repoSlug;

  return `${getApiRootHostname()}/v1/permissions/${domain}/${org}/${repo}`;
}

export interface PermissionEntry {
  name: string;
  displayName: string;
  found: boolean;
  locations: FindingEntry[];
}

export interface PermissionsResponse {
  gitUrl: string;
  commitHash: string;
  permissions: {
    [name: string]: PermissionEntry;
  };
}

export const PermissionsFetch = buildFetchComponent<PermissionsResponse>(
  permissionsUrl
);
