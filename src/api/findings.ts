export function findingsUrl(domain: string, org: string, repo: string) {
  return `https://api.secarta.io/v1/finding/${domain}/${org}/${repo}`;
}

export function postFindingsUrl(domain: string, org: string, repo: string) {
  return `https://api.secarta.io/v1/finding/${domain}/${org}/${repo}`;
}

export interface FindingsResponse {
  gitUrl: string;
  findings: FindingEntry[];
}

export interface FindingEntry {
  analyzerName: string;
  analyzerVersion: string;
  checkId: string;
  commitHash: string | null;
  endCol: number | null;
  endLine: number | null;
  extra: {};
  fileName: string;
  startCol: number | null;
  startLine: number | null;
  author?: string;
  sentiment?: { [key: string]: number };
  tags?: string[];
}
