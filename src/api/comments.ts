import { fetchJson, PostResponse } from "@r2c/extension/api/fetch";
import { extractSlugFromCurrentUrl } from "@r2c/extension/utils";

export interface DiscussionComment {
  text: string;
  author: string;
  created: string;
  inFlight?: boolean;
  reactions?: DiscussionReactions;
}

export interface DiscussionReactions {
  [emoji: string]: number;
}

interface CommentResponse {
  comments: DiscussionComment[];
  gitUrl: string;
}

type CommentPostResponse = CommentResponse & PostResponse;

export interface CommentPostBody {
  text: string;
  user: string;
}

function buildCommentsUri(): string {
  const { domain, org, repo } = extractSlugFromCurrentUrl();

  return `https://api.secarta.io/v1/comment/${domain}/${org}/${repo}`;
}

export async function getComments(): Promise<CommentResponse> {
  return fetchJson<CommentResponse>(buildCommentsUri());
}

export async function submitComment(
  body: CommentPostBody
): Promise<CommentPostResponse> {
  return fetchJson<CommentPostResponse>(buildCommentsUri(), {
    method: "POST",
    body: JSON.stringify(body)
  });
}
