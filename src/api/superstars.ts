import { extractSlugFromCurrentUrl } from "@r2c/extension/utils";

export function superstarsUrl() {
  const { domain, org, repo } = extractSlugFromCurrentUrl();

  return `https://api.secarta.io/v1/superstars/${domain}/${org}/${repo}`;
}

export interface SuperstarsResponse {
  examples: string[];
  count: number;
}
