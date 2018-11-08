import { ExtractedRepoSlug } from "@r2c/extension/utils";

export function repoUrl(repoSlug: ExtractedRepoSlug) {
  const { domain, org, repo } = repoSlug;

  return `https://api.secarta.io/v1/repo/${domain}/${org}/${repo}`;
}

export interface RepoResponse {
  gitUrl: string;
  activity: Activity;
  analyzedAt: string;
  commitHash: string;
}

export interface Activity {
  archived: boolean;
  isActive: boolean;
  latestCommitDate: string;
}
