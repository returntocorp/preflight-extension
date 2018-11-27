import { naivelyExtractCurrentUserFromPage } from "@r2c/extension/content/github/dom";
import { ExtensionContext } from "@r2c/extension/content/index";
import {
  ExtractedRepoSlug,
  fetchOrCreateExtensionUniqueId,
  getExtensionVersion
} from "@r2c/extension/utils";
import { merge } from "lodash";
import * as React from "react";
import Fetch, { FetchProps, FetchResult } from "react-fetch-component";

export function getAnalyticsParams(): {
  source: string;
  medium: string;
  content: string;
} {
  return {
    source: window.location.href,
    medium: `extension@${getExtensionVersion()}`,
    content: "voting-updown-vertical"
  };
}

export function buildExtensionHeaders(
  user: string | undefined,
  installationId: string | undefined
) {
  const installationIdComplete: string =
    installationId || "not-extension-source";

  return {
    "X-Secarta-GitHub-User": user || `anonymous-${installationIdComplete}`,
    "X-R2C-Extension-Installation-Id": installationIdComplete,
    "X-R2C-Extension-Version": getExtensionVersion() || "no version"
  };
}

export interface ApiFetchProps<T> extends Partial<FetchProps<T>> {
  repoSlug: ExtractedRepoSlug;
  children(result: FetchResult<T>): React.ReactNode;
}

export class RawApiFetch<T> extends React.Component<FetchProps<T>> {
  public render() {
    return (
      <ExtensionContext.Consumer>
        {({ user, installationId }) => {
          const options = merge(this.props.options, {
            headers: buildExtensionHeaders(user, installationId)
          });

          return <Fetch<T> {...this.props} options={options} />;
        }}
      </ExtensionContext.Consumer>
    );
  }
}

export async function fetchJson<T>(url: string | Request, init?: RequestInit) {
  const installationId = await fetchOrCreateExtensionUniqueId();
  const user = await naivelyExtractCurrentUserFromPage();

  const response = await fetch(url, {
    headers: buildExtensionHeaders(user, installationId),
    ...init
  });

  if (response.ok) {
    return response.json() as Promise<T>;
  } else {
    throw response.statusText;
  }
}

export interface PostResponse {
  recorded: boolean;
}

export type ApiFetchComponent<T> = React.ComponentType<ApiFetchProps<T>>;

type FetchBuildUrlFunction = (repoSlug: ExtractedRepoSlug) => string;

export function buildFetchComponent<ResponseT>(
  urlFn: FetchBuildUrlFunction
): React.SFC<ApiFetchProps<ResponseT>> {
  return ({ repoSlug, ...otherProps }) => (
    <RawApiFetch<ResponseT> {...otherProps} url={urlFn(repoSlug)} />
  );
}
