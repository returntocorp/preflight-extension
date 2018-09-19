// tslint:disable:no-any
type WindowBrowserShim = any;
// tslint:enable:no-any

declare global {
  interface Window {
    browser: WindowBrowserShim;
    chrome: WindowBrowserShim;
  }

  var browser: WindowBrowserShim;
}

if (window.browser == null && window.chrome != null) {
  window.browser = window.chrome;
}

export function getExtensionVersion(): string | undefined {
  if (browser != null && browser.runtime != null) {
    return browser.runtime.getManifest().version;
  }

  return undefined;
}

function byteToHex(byte: number) {
  return `0${byte.toString(16)}`.slice(-2);
}

interface ExtensionStorage {
  SECARTA_EXTENSION_INSTALLATION_ID?: string;
}

export async function fetchOrCreateExtensionUniqueId(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    browser.storage.local.get(
      "SECARTA_EXTENSION_INSTALLATION_ID",
      (res: ExtensionStorage) => {
        if (res.SECARTA_EXTENSION_INSTALLATION_ID != null) {
          resolve(res.SECARTA_EXTENSION_INSTALLATION_ID);
        } else {
          const randomBytes = new Uint8Array(20 / 2);
          window.crypto.getRandomValues(randomBytes);
          if (randomBytes.every(elem => elem === 0)) {
            // Edge crypto.getRandomValues returns all 0s
            // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11795162/
            // Fall back to less cryptographically random method (PRNG strength doesn't really matter)
            randomBytes.forEach(
              // tslint:disable-next-line:insecure-random
              (elem, index) => (randomBytes[index] = Math.random() * 255)
            );
          }

          const installationId: string = [].map
            .call(randomBytes, byteToHex)
            .join("");
          browser.storage.local.set({
            SECARTA_EXTENSION_INSTALLATION_ID: installationId
          });
          resolve(installationId);
        }
      }
    );
  });
}

export function userOrInstallationId(
  user: string | undefined,
  installationId: string
): string {
  return user || `anonymous-${installationId}`;
}

export interface ExtractedRepoSlug {
  domain: string;
  org: string;
  repo: string;
  pathname: string;
  rest: string;
}

function parseSlugFromUrl(url: string): ExtractedRepoSlug {
  const parsed = new URL(url);
  const { hostname: domain, pathname } = parsed;
  const [org, repo, ...rest] = pathname.slice(1).split("/");

  return { domain, org, repo, pathname, rest: rest.join("/") };
}

export function extractSlugFromCurrentUrl(): ExtractedRepoSlug {
  return parseSlugFromUrl(document.URL);
}

export function getSlugFromUrl(url: string): string {
  const { org, repo } = parseSlugFromUrl(url);

  return `${org}/${repo}`;
}

export function isRepositoryPrivate() {
  return document.querySelector("h1.private") != null;
}

export function buildGithubProfilePicUrl(user: string): string {
  return `${buildGithubProfileUrl(user)}.png`;
}

export function buildGithubProfileUrl(user: string): string {
  return `https://github.com/${user}`;
}

export async function fetchStringFromStorage(
  key: string
): Promise<string | undefined> {
  return new Promise<string | undefined>(resolve =>
    browser.storage.local.get(
      key,
      (results: { [k: string]: string | undefined }) => resolve(results[key])
    )
  );
}

export async function fetchFromStorage<T>(key: string): Promise<T | undefined> {
  return new Promise<T | undefined>(resolve =>
    browser.storage.local.get(key, (results: { [k: string]: T | undefined }) =>
      resolve(results[key])
    )
  );
}

export function updateStorage<T>(key: string, value: T) {
  browser.storage.local.set({ [key]: value });
}

const MOST_RECENT_GITHUB_USER = "MOST_RECENT_GITHUB_USER";

export function setGitHubUser(user: string) {
  browser.storage.local.set({ [MOST_RECENT_GITHUB_USER]: user });
}

export async function getGitHubUserFromStorage(): Promise<string | undefined> {
  return fetchStringFromStorage(MOST_RECENT_GITHUB_USER);
}

const PREFERRED_PACKAGE_MANAGER = "PREFERRED_PACKAGE_MANAGER";

export function setPreferredPackageManager(packageManager: string) {
  browser.storage.local.set({ [PREFERRED_PACKAGE_MANAGER]: packageManager });
}

export async function getPreferredPackageManager(): Promise<
  string | undefined
> {
  return fetchStringFromStorage(PREFERRED_PACKAGE_MANAGER);
}

export function nullableMin(
  a: number | null | undefined,
  b: number | null | undefined
): number | null {
  if (a == null) {
    return b != null ? b : null;
  }

  if (b == null) {
    return a;
  }

  return Math.min(a, b);
}

export function nullableMax(
  a: number | null | undefined,
  b: number | null | undefined
): number | null {
  if (a == null) {
    return b != null ? b : null;
  }

  if (b == null) {
    return a;
  }

  return Math.max(a, b);
}

export function buildFindingFileLink(
  repoSlug: ExtractedRepoSlug,
  commitHash: string | null,
  fileName: string,
  startLine: number | null,
  endLine?: number
): string {
  // TODO Retrieve default branch
  return `https://${repoSlug.domain}/${repoSlug.org}/${
    repoSlug.repo
  }/blob/${commitHash || "master"}/${fileName}${
    startLine != null ? `#L${startLine}` : ""
  }${endLine != null ? `-L${endLine}` : ""}`;
}
