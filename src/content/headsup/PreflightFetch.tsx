import { FindingsFetch, FindingsResponse } from "@r2c/extension/api/findings";
import { PackageResponse, PackagesFetch } from "@r2c/extension/api/package";
import { RepoFetch, RepoResponse } from "@r2c/extension/api/repo";
import { ScriptsFetch, ScriptsResponse } from "@r2c/extension/api/scripts";
import { ExtractedRepoSlug } from "@r2c/extension/utils";
import * as React from "react";

interface PreflightChecklistFetchProps {
  repoSlug: ExtractedRepoSlug;
  children(response: PreflightChecklistFetchResponse): React.ReactNode;
}

type PartialCoverage = { every: boolean | null; some: boolean | null };

interface PreflightChecklistFetchDataContents {
  repo: RepoResponse | undefined;
  pkg: PackageResponse | undefined;
  scripts: ScriptsResponse | undefined;
  findings: FindingsResponse | undefined;
}

export type PreflightChecklistFetchData = PreflightChecklistFetchDataContents &
  PartialCoverage;

export type PreflightChecklistFetchDataResponse = {
  [K in keyof PreflightChecklistFetchDataContents]: Response
};

export type PreflightChecklistLoading = {
  [K in keyof PreflightChecklistFetchDataContents]: boolean | null
} &
  PartialCoverage;

export type PreflightChecklistErrors = {
  [K in keyof PreflightChecklistFetchDataContents]: Error | undefined
} &
  PartialCoverage;

export interface PreflightChecklistFetchResponse {
  loading: PreflightChecklistLoading;
  error: PreflightChecklistErrors | undefined;
  data: PreflightChecklistFetchData | undefined;
  response: PreflightChecklistFetchDataResponse | undefined;
}

export default class PreflightFetch extends React.PureComponent<
  PreflightChecklistFetchProps
> {
  public render() {
    const { repoSlug } = this.props;

    return (
      <RepoFetch repoSlug={repoSlug}>
        {repoResponse => (
          <PackagesFetch repoSlug={repoSlug}>
            {packageResponse => (
              <FindingsFetch repoSlug={repoSlug}>
                {findingsResponse => (
                  <ScriptsFetch repoSlug={repoSlug}>
                    {scriptsResponse => {
                      // TODO (lediur) yeah I know all of these ternaries are gross
                      // TBD spending some time figuring out how to build a typesafe
                      // way to reusably compute `every` and `some` as booleans
                      // tslint:disable-next-line:cyclomatic-complexity
                      const loading: PreflightChecklistLoading = {
                        repo: repoResponse.loading,
                        pkg: packageResponse.loading,
                        findings: findingsResponse.loading,
                        scripts: scriptsResponse.loading,
                        every:
                          repoResponse.loading &&
                          packageResponse.loading &&
                          findingsResponse.loading &&
                          scriptsResponse.loading,
                        some:
                          repoResponse.loading ||
                          packageResponse.loading ||
                          findingsResponse.loading ||
                          scriptsResponse.loading
                      };

                      const error = !loading.every
                        ? {
                            repo: repoResponse.error,
                            pkg: packageResponse.error,
                            findings: findingsResponse.error,
                            scripts: scriptsResponse.error,
                            some:
                              repoResponse.error != null ||
                              packageResponse.error != null ||
                              findingsResponse.error != null ||
                              scriptsResponse.error != null,
                            every:
                              repoResponse.error != null &&
                              packageResponse.error != null &&
                              findingsResponse != null &&
                              scriptsResponse.error != null
                          }
                        : undefined;

                      const data = !loading.every
                        ? {
                            repo: repoResponse.data,
                            pkg: packageResponse.data,
                            findings: findingsResponse.data,
                            scripts: scriptsResponse.data,
                            every:
                              repoResponse.data != null &&
                              packageResponse.data != null &&
                              findingsResponse.data != null &&
                              scriptsResponse.data != null,
                            some:
                              repoResponse.data != null ||
                              packageResponse.data != null ||
                              findingsResponse.data != null ||
                              scriptsResponse.data != null
                          }
                        : undefined;

                      const response =
                        repoResponse.response != null &&
                        packageResponse.response != null &&
                        findingsResponse.response != null
                          ? {
                              repo: repoResponse.response,
                              pkg: packageResponse.response,
                              findings: findingsResponse.response,
                              scripts: scriptsResponse.response
                            }
                          : undefined;

                      const fetchResponse: PreflightChecklistFetchResponse = {
                        loading,
                        error,
                        data,
                        response
                      };

                      return this.props.children(fetchResponse);
                    }}
                  </ScriptsFetch>
                )}
              </FindingsFetch>
            )}
          </PackagesFetch>
        )}
      </RepoFetch>
    );
  }
}
