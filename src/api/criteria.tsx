import { buildFetchComponent } from "@r2c/extension/api/fetch";
import { OverrideEntry } from "@r2c/extension/api/package";
import { ExtractedRepoSlug, getApiRootHostname } from "@r2c/extension/utils";

export function criteriaUrl(
  repoSlug: ExtractedRepoSlug,
  version: string = "v1"
) {
  const { domain, org, repo } = repoSlug;

  return `${getApiRootHostname()}/${version}/criteria/${domain}/${org}/${repo}`;
}

export type CriteriaType = "safe" | "warning" | "danger" | "missing";

export interface CriteriaEntry {
  override?: OverrideEntry;
  checklist: number;
  rating: CriteriaType;
}

export interface CriteriaResponse {
  gitUrl: string;
  criteria: CriteriaEntry | null;
}

export const CriteriaFetch = buildFetchComponent<CriteriaResponse>(criteriaUrl);
