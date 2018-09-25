import { extractCurrentUserFromPage } from "@r2c/extension/content/github/dom";
import { ExtensionContext } from "@r2c/extension/content/index";
import {
  fetchOrCreateExtensionUniqueId,
  getExtensionVersion
} from "@r2c/extension/utils";
import { merge } from "lodash";
import * as React from "react";
import Fetch, { FetchProps } from "react-fetch-component";

export function getAnalyticsParams(): {
  source: string;
  medium: string;
  content: string;
} {
  return {
    source: document.location.toString(),
    medium: `extension@${getExtensionVersion()}`,
    content: "voting-updown-vertical"
  };
}

export function buildExtensionHeaders(
  user: string | undefined,
  installationId: string
) {
  return {
    "X-Secarta-GitHub-User": user || `anonymous-${installationId}`,
    "X-R2C-Extension-Installation-Id": installationId,
    "X-R2C-Extension-Version": getExtensionVersion() || "no version"
  };
}

export class ApiFetch<T> extends React.Component<FetchProps<T>> {
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

export async function fetchJson<T>(
  url: string | Request | undefined,
  init?: RequestInit
) {
  const installationId = await fetchOrCreateExtensionUniqueId();
  const user = await extractCurrentUserFromPage();

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
