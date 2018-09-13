import {
  Button,
  ButtonGroup,
  Classes,
  InputGroup,
  NonIdealState
} from "@blueprintjs/core";
import { l } from "@r2c/extension/analytics";
import { PackageResponse, packageUrl } from "@r2c/extension/api/package";
import CopyButton from "@r2c/extension/shared/CopyButton";
import ProfilePicture from "@r2c/extension/shared/ProfilePicture";
import {
  getPreferredPackageManager,
  setPreferredPackageManager
} from "@r2c/extension/utils";
import * as classnames from "classnames";
import * as copy from "copy-to-clipboard";
import * as React from "react";
import Fetch from "react-fetch-component";
import "./PackageCopyBox.css";

type PackageManagerChoice = "npm" | "yarn";

interface RepoPackageSectionState {
  packageManager: PackageManagerChoice;
}

export default class RepoPackageSection extends React.Component<
  {},
  RepoPackageSectionState
> {
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
            {loading && (
              <div
                className={classnames("nutrition-section-value", {
                  [Classes.SKELETON]: loading
                })}
              >
                <NonIdealState icon="globe" title="Loading..." />
              </div>
            )}
            {data && (
              <div className="nutrition-section-value">
                {data.packages.length === 0 && (
                  <NonIdealState
                    icon="box"
                    description="Not published to NPM"
                  />
                )}
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
                    and {data.packages.length - 1} more package
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
