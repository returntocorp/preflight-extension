export function getExtensionVersion(): string | undefined {
  if (browser != null && browser.runtime != null) {
    return browser.runtime.getManifest().version;
  }

  return undefined;
}
