import { FindingsResponse } from "@r2c/extension/api/findings";
import * as classnames from "classnames";
import * as React from "react";
import "./FindingsTwist.css";

interface RepoSlug {
  domain: string;
  org: string;
  repo: string;
}

interface FindingsTwistProps {
  repoSlug: RepoSlug | undefined;
  loading: boolean | null;
  error: Error | undefined;
  data: FindingsResponse | undefined;
}

function buildFindingFileLink(
  repoSlug: RepoSlug,
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

const FindingsList: React.SFC<FindingsTwistProps> = ({
  repoSlug,
  loading,
  error,
  data
}) => {
  if (repoSlug != null) {
    return (
      <>
        {loading && <section className="findings loading">Loading...</section>}
        {error && (
          <section className="findings error">Couldn't load findings</section>
        )}
        {data && (
          <>
            <section className="findings">
              {data.findings.map((finding, i) => (
                <article className="finding" key={i}>
                  <header className="finding-header">
                    <h2 className="finding-checkid">{finding.checkId}</h2>
                    <span className="finding-full-path">
                      <a
                        href={buildFindingFileLink(
                          repoSlug,
                          finding.commitHash,
                          finding.fileName,
                          finding.startLine
                        )}
                      >
                        <span className="finding-path-filename">
                          {finding.fileName}
                        </span>
                        {finding.startLine != null && (
                          <span className="finding-line-number">
                            :{finding.startLine}
                          </span>
                        )}
                      </a>
                    </span>
                  </header>
                </article>
              ))}
            </section>
          </>
        )}
      </>
    );
  } else {
    return null;
  }
};

export default class FindingsTwist extends React.Component<FindingsTwistProps> {
  public render() {
    const { repoSlug, loading, error, data } = this.props;

    return (
      <div className={classnames("twist", "findings-twist")}>
        <header className="twist-header">
          <h1 className="twist-title">Findings</h1>
        </header>
        <div className="twist-body">
          <FindingsList
            repoSlug={repoSlug}
            loading={loading}
            error={error}
            data={data}
          />
        </div>
      </div>
    );
  }
}
