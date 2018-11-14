import { buildFetchComponent } from "@r2c/extension/api/fetch";
import { ExtractedRepoSlug, getApiRootHostname } from "@r2c/extension/utils";

export function scriptsUrl(repoSlug: ExtractedRepoSlug) {
  const { domain, org, repo } = repoSlug;

  return `${getApiRootHostname()}/v1/scripts/${domain}/${org}/${repo}`;
}

export interface ScriptsResponse {
  gitUrl: string;
  scripts: ScriptEntry[] | null;
}

export interface ScriptEntry {
  script: string;

  // Disabling TSlint because the API returns a property called `type`
  // tslint:disable-next-line:no-reserved-keywords
  type: string;
}

export const ScriptsFetch = buildFetchComponent<ScriptsResponse>(scriptsUrl);
