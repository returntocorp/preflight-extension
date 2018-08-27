import { NonIdealState, Spinner } from "@blueprintjs/core";
import {
  PermissionsResponse,
  permissionsUrl
} from "@r2c/extension/api/permissions";
import { scoreRepoUrl, ScoreResponse } from "@r2c/extension/api/score";
import * as classnames from "classnames";
import * as React from "react";
import Fetch from "react-fetch-component";
import "./RepoTwist.css";

interface RepoTwistProps {
  repoSlug: { domain: string; org: string; repo: string } | undefined;
}

const RepoNoData: React.SFC = () => (
  <NonIdealState
    icon={
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path d="M16.335 5.995l1.707-1.723 1.686 1.67 1.272-1.272-1.685-1.67 1.637-1.679-1.272-1.273-1.637 1.679-1.685-1.727-1.272 1.273 1.684 1.726-1.708 1.724 1.273 1.272zm.535 2.005c-.577 2.317-2.445 2.723-4.817 3.223-1.71.36-3.643.775-5.053 2.085v-7.492c1.162-.413 2-1.511 2-2.816 0-1.657-1.343-3-3-3s-3 1.343-3 3c0 1.305.838 2.403 2 2.816v12.367c-1.162.414-2 1.512-2 2.817 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.295-.824-2.388-1.973-2.808.27-3.922 2.57-4.408 5.438-5.012 2.611-.55 5.733-1.23 6.435-5.18h-2.03zm-12.67-5c0-.993.808-1.8 1.8-1.8s1.8.807 1.8 1.8-.808 1.8-1.8 1.8-1.8-.807-1.8-1.8zm3.6 18c0 .993-.808 1.8-1.8 1.8s-1.8-.807-1.8-1.8.808-1.8 1.8-1.8 1.8.807 1.8 1.8z" />
      </svg>
    }
    title="Couldn't get repo data"
  />
);

const RepoScoreSection: React.SFC = () => (
  <Fetch<ScoreResponse> url={scoreRepoUrl()}>
    {({ loading, data, error, response }) => (
      <section className="nutrition-score nutrition-inline">
        <header className="nutrition-title">Score</header>
        {loading && (
          <span className="nutrition-inline-value loading">Loading...</span>
        )}
        {data && (
          <span className="nutrition-inline-value">{data.metascore.score}</span>
        )}
        {error && <span className="nutrition-inline-value error">N/A</span>}
      </section>
    )}
  </Fetch>
);

const RepoPermissionsSection: React.SFC = () => (
  <Fetch<PermissionsResponse> url={permissionsUrl()}>
    {({ loading, data, error, response }) => (
      <section className="nutrition-permissions nutrition-section">
        <header className="nutrition-title">Permissions</header>
        {loading && (
          <div className="nutrition-section-value loading">
            <NonIdealState icon={<Spinner />} title="Loading..." />
          </div>
        )}
        {data && (
          <div className="nutrition-section-value">
            {Object.keys(data.permissions).map(key => (
              <div key={key} className="nutrition-permission">
                <span className="permission-name">
                  {data.permissions[key].displayName}
                </span>
                <span className="permission-found">
                  {data.permissions[key].found ? "Detected" : "Not found"}
                </span>
              </div>
            ))}
          </div>
        )}
        {error && (
          <div className="nutrition-section-value error">
            <NonIdealState
              title="No permissions"
              description={JSON.stringify(error)}
            />
          </div>
        )}
      </section>
    )}
  </Fetch>
);

export default class RepoTwist extends React.Component<RepoTwistProps> {
  public render() {
    const { repoSlug } = this.props;

    return (
      <div className={classnames("twist", "repo-twist")}>
        {repoSlug == null ? (
          <RepoNoData />
        ) : (
          <>
            <header className="twist-header">
              <h1 className="twist-title">
                {repoSlug.org}/{repoSlug.repo}
              </h1>
            </header>
            <div className="twist-body">
              <RepoScoreSection />
              <RepoPermissionsSection />
            </div>
          </>
        )}
      </div>
    );
  }
}
