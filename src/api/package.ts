import { extractSlugFromCurrentUrl } from "@r2c/extension/utils";

export function packageUrl() {
  const { domain, org, repo } = extractSlugFromCurrentUrl();

  return `https://api.secarta.io/v1/package/${domain}/${org}/${repo}`;
}

export interface PackageEntry {
  endorsers: string[];
  name: string;
  registry: string;
}

export interface PackageResponse {
  gitUrl: string;
  packages: PackageEntry[];
}
