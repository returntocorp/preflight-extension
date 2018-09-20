import { extractSlugFromCurrentUrl } from "@r2c/extension/utils";

export function packageUrl() {
  const { domain, org, repo } = extractSlugFromCurrentUrl();

  return `https://api.secarta.io/v1/package/${domain}/${org}/${repo}`;
}

export interface PackageEntry {
  endorsers: string[];
  name: string;
  registry: string;
  package_rank: number;
  rank_description: string;
}

export interface ScriptEntry {
  script: string;

  // Disabling TSlint because the API returns a property called `type`
  // tslint:disable-next-line:no-reserved-keywords
  type: string;
}

export interface PackageResponse {
  gitUrl: string;
  packages: PackageEntry[];
  npmScripts: ScriptEntry[];
}
