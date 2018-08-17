export function fetchExtensionVersion() {
  return browser.runtime.getManifest().version;
}
