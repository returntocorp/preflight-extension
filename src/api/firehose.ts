import { fetchJson } from "@r2c/extension/api/fetch";

interface FirehoseResponse {
  activity: FirehoseActivity[];
}

export interface FirehoseActivity {
  action: string;
  actionValue: string;
  author: string;
  gitUrl: string;
  timestamp: string;
}

function buildFirehoseUrl() {
  return `https://prodapi.secarta.io/v1/firehose`;
}

export async function getFirehose(): Promise<FirehoseResponse> {
  return fetchJson<FirehoseResponse>(buildFirehoseUrl());
}
