import { extractSlugFromCurrentUrl } from "@r2c/extension/utils";

export function permissionsUrl() {
  const { domain, org, repo } = extractSlugFromCurrentUrl();

  return `https://api.secarta.io/v1/permissions/${domain}/${org}/${repo}`;
}

export interface PermissionEntry {
  name: string;
  displayName: string;
  found: boolean;
  locations: PermissionLocation[];
}

export interface PermissionLocation {
  file_name: string;
  start_line: number;
}

export interface PermissionsResponse {
  gitUrl: string;
  commitHash: string;
  permissions: {
    [name: string]: PermissionEntry;
  };
}
