import { ExtractedRepoSlug, parseSlugFromUrl } from "@r2c/extension/utils";
import UnfurlBuilder from "@r2c/extension/web/UnfurlBuilder";
import * as React from "react";

const codeSnippet = `const foo = exec("preflight");`;

const repoSlug: ExtractedRepoSlug = parseSlugFromUrl(
  "https://github.com/scravy/node-macaddress/blob/ee37051ebe4115cce0007c02ac9ecb2ac66154d4/lib/unix.js#L1"
);

export default class LandingPage extends React.PureComponent {
  public render() {
    return (
      <UnfurlBuilder
        landingDomain="strong-kangaroo-95.localtunnel.me"
        codeSnippet={codeSnippet}
        repoSlug={repoSlug}
      />
    );
  }
}
