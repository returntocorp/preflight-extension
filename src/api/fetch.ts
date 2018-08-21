import {
  extractSlugFromCurrentUrl,
  fetchOrCreateExtensionUniqueId,
  getExtensionVersion
} from "@r2c/extension/utils";

export async function extractCurrentUserFromPage(): Promise<
  string | undefined
> {
  const { domain } = extractSlugFromCurrentUrl();

  if (domain.includes("github.com")) {
    const userLoginMetaTags = document.getElementsByName("user-login");

    if (userLoginMetaTags.length === 0) {
      return undefined;
    }

    const user = userLoginMetaTags[0].getAttribute("content");

    if (user != null && user !== "") {
      return user;
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
}

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
    "X-Secarta-GitHub-User": user || "anonymous",
    "X-R2C-Extension-Installation-Id": installationId
  };
}

export const fetchJson = async <T>(
  url: string | Request | undefined,
  init?: RequestInit
) => {
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
};

export interface PostResponse {
  recorded: boolean;
}
