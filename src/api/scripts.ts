import { extractSlugFromCurrentUrl } from "@r2c/extension/utils";

export function scriptsUrl() {
  const { domain, org, repo } = extractSlugFromCurrentUrl();

  return `https://api.secarta.io/v1/scripts/${domain}/${org}/${repo}`;
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
