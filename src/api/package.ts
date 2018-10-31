import { extractSlugFromCurrentUrl } from "@r2c/extension/utils";

export function packageUrl(version: string = "v2") {
  const { domain, org, repo } = extractSlugFromCurrentUrl();

  return `https://api.secarta.io/${version}/package/${domain}/${org}/${repo}`;
}

export function relatedPackagesUrl() {
  return `${packageUrl("v1")}/related`;
}

export interface PackageEntry {
  endorsers: string[];
  name: string;
  registry: string;
  package_rank: number;
  rank_description: string;
}

export interface PackageResponse {
  gitUrl: string;
  packages: PackageEntry[];
}

export interface RelatedPackageEntry {
  related: string;
  occurs: number;
  packageOccurs: number;
  relatedOccurs: number;
  sourceUrl: string;
}

export interface RelatedPackagesResponse {
  gitUrl: string;
  related: { [k: string]: RelatedPackageEntry[] };
}
