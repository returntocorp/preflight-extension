import { fetchJson } from "@r2c/extension/api/fetch";
import { extractSlugFromCurrentUrl } from "@r2c/extension/utils";

export interface DiscussionComment {
  text: string;
  author: string;
  created: string;
  reactions?: DiscussionReactions;
}

export interface DiscussionReactions {
  [emoji: string]: number;
}

interface CommentResponse {
  comments: DiscussionComment[];
  gitUrl: string;
}

function buildCommentsUri(domain: string, org: string, repo: string): string {
  return `https://api.secarta.io/v1/comment/${domain}/${org}/${repo}`;
}

export async function getComments(): Promise<CommentResponse> {
  const { domain, org, repo } = extractSlugFromCurrentUrl();

  return fetchJson<CommentResponse>(buildCommentsUri(domain, org, repo));
}
