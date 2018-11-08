import { ExtractedRepoSlug } from "@r2c/extension/utils";

export function scoreRepoUrl(repoSlug: ExtractedRepoSlug) {
  const { domain, org, repo } = repoSlug;

  return `https://api.secarta.io/v1/score/${domain}/${org}/${repo}`;
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
