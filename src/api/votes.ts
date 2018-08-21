import { fetchJson, getAnalyticsParams } from "@r2c/extension/api/fetch";
import { extractSlugFromCurrentUrl } from "@r2c/extension/utils";

interface VoteCounts {
  [key: string]: number;
}

type SampleVoters = { [K in keyof VoteCounts]: string[] };

export interface VoteResponse {
  votes: VoteCounts;
  currentVote: string | null;
  sampleVoters: SampleVoters;
}

export interface VotePostBody {
  vote: string | null;
  user: string | null;
}

function buildVotingUrl({
  source,
  medium,
  content
}: {
  source: string;
  medium: string;
  content: string;
}) {
  const { domain, org, repo } = extractSlugFromCurrentUrl();
  const params = new URLSearchParams({ source, medium, content });

  return `https://api.secarta.io/v1/vote/${domain}/${org}/${repo}?${params}`;
}

export async function getVotes(): Promise<VoteResponse> {
  const votesUrl = buildVotingUrl(getAnalyticsParams());

  return fetchJson<VoteResponse>(votesUrl);
}

export async function submitVote(body: VotePostBody): Promise<VoteResponse> {
  const votesUrl = buildVotingUrl(getAnalyticsParams());

  return fetchJson<VoteResponse>(votesUrl, {
    method: "POST",
    body: JSON.stringify(body)
  });
}
