import { ExtractedRepoSlug } from "@r2c/extension/utils";

export function packageUrl(
  repoSlug: ExtractedRepoSlug,
  version: string = "v2"
) {
  const { domain, org, repo } = repoSlug;

  return `https://api.secarta.io/${version}/package/${domain}/${org}/${repo}`;
}

export function relatedPackagesUrl(repoSlug: ExtractedRepoSlug) {
  return `${packageUrl(repoSlug, "v1")}/related`;
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
