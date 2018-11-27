import { Button } from "@blueprintjs/core";
import { VulnerabilityEntry } from "@r2c/extension/api/vulns";
import * as classnames from "classnames";
import * as React from "react";
import * as Markdown from "react-markdown";
import TimeAgo from "react-timeago";

interface VulnEntryProps {
  vuln: VulnerabilityEntry;
}

interface VulnEntryState {
  showMore: boolean;
}

export default class VulnEntry extends React.PureComponent<
  VulnEntryProps,
  VulnEntryState
> {
  public state: VulnEntryState = {
    showMore: false
  };

  public render() {
    const { vuln } = this.props;
    const { showMore } = this.state;

    return (
      <article className="preflight-vulnerability-entry">
        <header>
          <div className="vuln-cves">
            {vuln.cves.length > 0 ? (
              vuln.cves.map(cve => (
                <div className="vuln-cve" key={cve}>
                  {cve}
                </div>
              ))
            ) : (
              <span className="no-vuln-cve">No CVE assigned</span>
            )}
          </div>
          <h2 className="vuln-title">{vuln.title}</h2>
          <div className="vuln-versions">
            <span className="vuln-affected">
              Vulnerable{" "}
              <span className="vuln-version">{vuln.vulnerable_versions}</span>
            </span>
            <span className="vuln-patched">
              Patched{" "}
              <span className="vuln-version">{vuln.patched_versions}</span>
            </span>
          </div>
          <div className="vuln-metadata">
            Found{" "}
            <span className="vuln-published">
              <TimeAgo date={new Date(vuln.publish_date)} />
            </span>{" "}
            by <span className="vuln-author">{vuln.author}</span>
          </div>
        </header>
        {showMore && (
          <div
            className={classnames("vuln-body", {
              visible: showMore,
              hidden: !showMore
            })}
          >
            <section className="vuln-overview">
              <header>Overview</header>
              <Markdown source={vuln.overview} />
            </section>
            <section className="vuln-recommendations">
              <header>Recommendations</header>
              <Markdown source={vuln.recommendation} />
            </section>
            <section className="vuln-references">
              <header>References</header>
              <Markdown source={vuln.references} />
            </section>
            <section className="vuln-errata">
              <header>Errata</header>
              <dl>
                <dt>CVSS Vector</dt>
                <dd>{vuln.cvss_vector}</dd>
                <dt>CVSS Score</dt>
                <dd>{vuln.cvss_score}</dd>
              </dl>
            </section>
          </div>
        )}
        <Button
          className="vuln-show-more-button"
          minimal={true}
          fill={true}
          onClick={this.handleToggleShowMore}
        >
          Show {showMore ? "less" : "more"}
        </Button>
      </article>
    );
  }

  private handleToggleShowMore: React.MouseEventHandler<HTMLElement> = e =>
    this.setState({ showMore: !this.state.showMore });
}
