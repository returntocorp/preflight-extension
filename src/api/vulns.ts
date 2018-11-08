import { ExtractedRepoSlug, getApiRootHostname } from "@r2c/extension/utils";

export function vulnsUrl(repoSlug: ExtractedRepoSlug) {
  const { domain, org, repo } = repoSlug;

  return `${getApiRootHostname()}/v1/vuln/${domain}/${org}/${repo}`;
}

export interface VulnsResponse {
  gitUrl: string;
  vuln: VulnerabilityEntriesContainer[];
}

export interface VulnerabilityEntriesContainer {
  package_name: string;
  vuln: VulnerabilityEntry[];
}

export interface VulnerabilityEntry {
  allowed_scopes: string[];
  author: string;
  created_at: Date;
  cves: string[];
  cvss_score: number;
  cvss_vector: string;
  cwe: string;
  id: number;
  module_name: string;
  overview: string;
  patched_versions: string;
  publish_date: string;
  recommendation: string;
  references: string;
  slug: string;
  title: string;
  updated_at: Date;
  vulnerable_versions: string;
}
