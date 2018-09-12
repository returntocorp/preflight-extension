import { extractSlugFromCurrentUrl } from "@r2c/extension/utils";

export function activityUrl() {
  const { domain, org, repo } = extractSlugFromCurrentUrl();

  return `https://api.secarta.io/v1/activity/${domain}/${org}/${repo}`;
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
