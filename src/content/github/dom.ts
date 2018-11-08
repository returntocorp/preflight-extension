import {
  naivelyExtractSlugFromCurrentUrl,
  setGitHubUser
} from "@r2c/extension/utils";

export async function naivelyExtractCurrentUserFromPage(): Promise<
  string | undefined
> {
  const { domain } = naivelyExtractSlugFromCurrentUrl();

  if (domain.includes("github.com")) {
    const userLoginMetaTags = document.getElementsByName("user-login");

    if (userLoginMetaTags == null || userLoginMetaTags.length === 0) {
      return undefined;
    }

    const user = userLoginMetaTags[0].getAttribute("content");

    if (user != null && user !== "") {
      setGitHubUser(user);

      return user;
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
}
