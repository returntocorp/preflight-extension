import { Button, ButtonGroup, Classes, InputGroup, NonIdealState, Spinner } from "@blueprintjs/core";
import { l } from "@r2c/extension/analytics";
import { PackageResponse, packageUrl } from "@r2c/extension/api/package";
import { PermissionsResponse, permissionsUrl } from "@r2c/extension/api/permissions";
import { scoreRepoUrl, ScoreResponse } from "@r2c/extension/api/score";
import { SuperstarsResponse, superstarsUrl } from "@r2c/extension/api/superstars";
import CopyButton from "@r2c/extension/shared/CopyButton";
import ProfilePicture from "@r2c/extension/shared/ProfilePicture";
import { getPreferredPackageManager, setPreferredPackageManager } from "@r2c/extension/utils";
import * as classnames from "classnames";
import * as copy from "copy-to-clipboard";
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
        <header className="nutrition-title">Score (WIP)</header>
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

const RepoSuperstarsSection: React.SFC = () => (
  <Fetch<SuperstarsResponse> url={superstarsUrl()}>
    {({ loading, data, error, response }) => (
      <section className="nutrition-superstars nutrition-inline">
        <header className="nutrition-title">Superstars</header>
        {loading && (
          <span className="nutrition-inline-value loading">Loading...</span>
        )}
        {data && (
          <div>
            <span className="nutrition-inline-value">{data.count}</span>
            <span className="nutrition-inline-value">
              including:{" "}
              {data.examples.map(login => (
                <a href={`https://github.com/${login}`}> {login} </a>
              ))}
            </span>
          </div>
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

type PackageManagerChoice = "npm" | "yarn";

interface RepoPackageSectionState {
  packageManager: PackageManagerChoice;
}

class RepoPackageSection extends React.Component<{}, RepoPackageSectionState> {
  public DEFAULT_PACKAGE_MANAGER: PackageManagerChoice = "npm";

  public state: RepoPackageSectionState = {
    packageManager: this.DEFAULT_PACKAGE_MANAGER
  };

  private packageFieldRef: { [key: string]: HTMLInputElement | null } = {};

  public componentDidMount() {
    this.fetchPreferredPackageManager();
  }

  public render() {
    return (
      <Fetch<PackageResponse> url={packageUrl()}>
        {({ loading, data, error }) => (
          <section className="nutrition-packages nutrition-section">
            <header className="nutrition-title">Packages</header>
            {loading && (
              <div className="nutrition-section-value loading">
                <NonIdealState icon={<Spinner />} title="Loading..." />
              </div>
            )}
            {data && (
              <div className="nutrition-section-value">
                {data.packages.slice(0, 1).map((entry, i) => (
                  <div key={i} className="nutrition-package">
                    <header className="package-header">
                      <span className="package-name">
                        <a
                          href={this.buildPackageLink(entry.name)}
                          onClick={l("npm-package-link-click", undefined, {
                            packageName: entry.name
                          })}
                        >
                          {entry.name}
                        </a>
                      </span>
                      {entry.endorsers && (
                        <div className="package-endorsers">
                          {entry.endorsers.slice(0, 3).map(endorser => (
                            <ProfilePicture
                              key={endorser}
                              user={endorser}
                              className="package-endorser"
                            />
                          ))}
                          {entry.endorsers.length > 3 && (
                            <span className="package-endorsers-more">
                              +{entry.endorsers.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </header>

                    <InputGroup
                      type="text"
                      value={this.buildInstallCommand(
                        this.state.packageManager,
                        entry.name
                      )}
                      rightElement={
                        <CopyButton
                          onClick={l(
                            "copy-package-button-click",
                            this.handleCopy(
                              this.state.packageManager,
                              entry.name
                            ),
                            {
                              packageManager: this.state.packageManager,
                              name: entry.name
                            }
                          )}
                        />
                      }
                      onClick={l("copy-package-input-click")}
                      className={classnames(Classes.FILL, "package-npm-field")}
                      inputRef={this.setPackageFieldRef(
                        this.state.packageManager,
                        entry.name
                      )}
                      readOnly={true}
                    />

                    <ButtonGroup className={Classes.FILL}>
                      <Button
                        active={this.state.packageManager === "npm"}
                        onClick={l(
                          "choose-package-manager",
                          this.handleRegistryChange("npm"),
                          {
                            oldPackageManager: this.state.packageManager,
                            newChoice: "npm"
                          }
                        )}
                      >
                        NPM
                      </Button>
                      <Button
                        active={this.state.packageManager === "yarn"}
                        onClick={l(
                          "choose-package-manager",
                          this.handleRegistryChange("yarn"),
                          {
                            oldPackageManager: this.state.packageManager,
                            newChoice: "yarn"
                          }
                        )}
                      >
                        Yarn
                      </Button>
                    </ButtonGroup>
                  </div>
                ))}
                {data.packages.length > 1 && (
                  <div className="nutrition-package-more">
                    and {data.packages.length - 1} more
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </Fetch>
    );
  }

  private fetchPreferredPackageManager = async () => {
    const packageManager = (await getPreferredPackageManager()) as PackageManagerChoice;
    if (packageManager != null) {
      this.setState({
        packageManager: packageManager || this.DEFAULT_PACKAGE_MANAGER
      });
    }
  };

  private handleRegistryChange = (packageManager: PackageManagerChoice) => (
    e: React.MouseEvent<HTMLElement>
  ) => {
    this.setState({ packageManager });
    setPreferredPackageManager(packageManager);
  };

  private handleCopy = (registry: string, packageName: string) => (
    e: React.MouseEvent<HTMLElement>
  ) => {
    const key = this.buildPackageFieldRefKey(registry, packageName);
    const toCopy = this.packageFieldRef[key];

    if (toCopy != null) {
      toCopy.focus();
      toCopy.setSelectionRange(0, toCopy.value.length);
      this.copyToClipboard(this.buildInstallCommand(registry, packageName));
    }
  };

  private copyToClipboard = (toCopy: string) => {
    return copy(toCopy);
  };

  private setPackageFieldRef = (registry: string, packageName: string) => (
    ref: HTMLInputElement | null
  ) => {
    const key = this.buildPackageFieldRefKey(registry, packageName);
    this.packageFieldRef[key] = ref;
  };

  private buildPackageFieldRefKey = (
    registry: string,
    packageName: string
  ): string => `${registry}/${packageName}`;

  private buildInstallCommand = (
    registry: string,
    packageName: string,
    dev: boolean = false
  ): string => {
    const cmds = {
      npm: `npm install ${dev ? "-D " : ""}${packageName}`,
      yarn: `yarn add ${dev ? "-D " : ""}${packageName}`
    };
    switch (registry) {
      case "npm":
        return cmds.npm;
      case "yarn":
        return cmds.yarn;
      default:
        return cmds.npm;
    }
  };

  private buildPackageLink = (name: string): string =>
    `https://npmjs.com/package/${name}`;
}

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
              <RepoPackageSection />
              <RepoSuperstarsSection />
            </div>
          </>
        )}
      </div>
    );
  }
}
