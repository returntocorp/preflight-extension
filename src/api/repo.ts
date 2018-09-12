import { extractSlugFromCurrentUrl } from "@r2c/extension/utils";

export function repoUrl() {
  const { domain, org, repo } = extractSlugFromCurrentUrl();

  return `https://api.secarta.io/v1/repo/${domain}/${org}/${repo}`;
}

export interface RepoResponse {
  gitUrl: string;
  activity: Activity;
}

export interface Activity {
    archived: string,
    is_active: string,
    latest_commit_date: Date
}