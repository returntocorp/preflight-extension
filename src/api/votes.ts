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

export interface ControversialVoteStatistics {
  gitUrl: string;
  down: number;
  up: number;
}

export interface VoteCountStatistics {
  gitUrl: string;
  numVotes: number;
}

interface RecentVoteEvent {
  gitUrl: string;
  timestamp: string;
  user: string;
  vote: string;
}

export interface VoteOverviewResponse {
  mostControversial: ControversialVoteStatistics[];
  mostVoted: VoteCountStatistics[];
  recent: RecentVoteEvent[];
}

export function buildVotingUrl({
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

function buildVoteOverviewUrl() {
  return `https://api.secarta.io/v1/vote/overview`;
}

export async function DEPRECATED_getVotes(): Promise<VoteResponse> {
  const votesUrl = buildVotingUrl(getAnalyticsParams());

  return fetchJson<VoteResponse>(votesUrl);
}

export async function DEPRECATED_submitVote(
  body: VotePostBody
): Promise<VoteResponse> {
  const votesUrl = buildVotingUrl(getAnalyticsParams());

  return fetchJson<VoteResponse>(votesUrl, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function DEPRECATED_getVoteOverview(): Promise<
  VoteOverviewResponse
> {
  const voteOverviewUrl = buildVoteOverviewUrl();

  return fetchJson<VoteOverviewResponse>(voteOverviewUrl);
}
