import { ExtractedRepoSlug, getApiRootHostname } from "@r2c/extension/utils";

export function repoUrl(repoSlug: ExtractedRepoSlug) {
  const { domain, org, repo } = repoSlug;

  return `${getApiRootHostname()}/v1/repo/${domain}/${org}/${repo}`;
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
