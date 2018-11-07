import { extractSlugFromCurrentUrl } from "@r2c/extension/utils";

export function scoreRepoUrl() {
  const { domain, org, repo } = extractSlugFromCurrentUrl();

  return `https://prodapi.secarta.io/v1/score/${domain}/${org}/${repo}`;
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
