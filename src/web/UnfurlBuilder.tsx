import { ExtractedRepoSlug } from "@r2c/extension/utils";
import * as React from "react";
import { Helmet } from "react-helmet";

interface UnfurlProps {
  repoSlug: ExtractedRepoSlug;
  codeSnippet: string;
  landingDomain: string;
}

class OpenGraphUnfurl extends React.PureComponent<UnfurlProps> {
  public render() {
    return (
      <Helmet>
        <meta property="og:type" content="website" />
        <meta property="og:url" content={buildUnfurlUrl(this.props)} />
        <meta property="og:title" content={buildUnfurlTitle(this.props)} />
        <meta
          property="og:description"
          content={buildUnfurlDescription(this.props)}
        />
        <meta property="og:site_name" content="Preflight" />
        <meta property="og:image" content={buildUnfurlImageUrl(this.props)} />
      </Helmet>
    );
  }
}

class TwitterUnfurl extends React.PureComponent<UnfurlProps> {
  public render() {
    const { landingDomain } = this.props;

    return (
      <Helmet>
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:domain" content={landingDomain} />
        <meta name="twitter:title" content={buildUnfurlTitle(this.props)} />
        <meta
          name="twitter:description"
          content={buildUnfurlDescription(this.props)}
        />
        <meta name="twitter:image" content={buildUnfurlImageUrl(this.props)} />
        <meta name="twitter:url" content={buildUnfurlUrl(this.props)} />
        <meta name="twitter:label1" content="Package coolness" />
        <meta name="twitter:data1" content="p cool" />
        <meta name="twitter:label2" content="Number of issues" />
        <meta name="twitter:data2" content="I dunno" />
      </Helmet>
    );
  }
}

export function buildUnfurlTitle({ repoSlug }: UnfurlProps): string {
  if (repoSlug.filePath != null) {
    return `${repoSlug.filePath} on ${repoSlug.org}/${
      repoSlug.repo
    } - Preflight`;
  } else {
    return `${repoSlug.org}/${repoSlug.repo} - Preflight`;
  }
}

export function buildUnfurlDescription({ codeSnippet }: UnfurlProps): string {
  return `\`\`\`
${codeSnippet}
\`\`\``;
}

export function buildUnfurlImageUrl({ codeSnippet }: UnfurlProps): string {
  // const encodedSnippet = btoa(codeSnippet);

  // return `https://unfurl.prf.lt/preview?language=ts&code=${encodedSnippet}`;
  // TODO temporary standin
  return `https://s3-us-west-2.amazonaws.com/preflight-static-pub/preflight-banner.png`;
}

export function buildUnfurlUrl({
  repoSlug,
  landingDomain
}: UnfurlProps): string {
  return `https://${landingDomain}/gh/${repoSlug.org}/${repoSlug.repo}/f/`;
}

export default class UnfurlBuilder extends React.PureComponent<UnfurlProps> {
  public render() {
    return (
      <>
        <OpenGraphUnfurl {...this.props} />
        <TwitterUnfurl {...this.props} />
      </>
    );
  }
}
