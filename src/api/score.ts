import { ExtractedRepoSlug, getApiRootHostname } from "@r2c/extension/utils";

export function scoreRepoUrl(repoSlug: ExtractedRepoSlug) {
  const { domain, org, repo } = repoSlug;

  return `${getApiRootHostname()}/v1/score/${domain}/${org}/${repo}`;
}

interface MetascoreResponse {
  factors: string[];
  score: number;
  startsWith: number;
}

export interface ScoreResponse {
  computed: string;
  gitUrl: string;
  metascore: MetascoreResponse;
  version: number;
}
