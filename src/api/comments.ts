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

export interface CommentMentionsResponse {
  mentions: CommentMention[];
}

export interface CommentMention {
  author: string;
  gitUrl: string;
  text: string;
  timestamp: string;
}

type CommentPostResponse = CommentResponse & PostResponse;

export interface CommentPostBody {
  text: string;
  user: string;
}

function buildCommentsUri(): string {
  const { domain, org, repo } = extractSlugFromCurrentUrl();

  return `https://prodapi.secarta.io/v1/comment/${domain}/${org}/${repo}`;
}

function buildCommentMentionUri(user: string): string {
  return `https://prodapi.secarta.io/v1/comment/mention/${user}`;
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

export async function getCommentMentions(
  user: string
): Promise<CommentMentionsResponse> {
  return fetchJson<CommentMentionsResponse>(buildCommentMentionUri(user));
}
