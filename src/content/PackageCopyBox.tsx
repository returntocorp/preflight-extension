import {
  AnchorButton,
  Button,
  ButtonGroup,
  Classes,
  InputGroup,
  Intent,
  MenuItem,
  NonIdealState,
  Position
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { ItemListPredicate, ItemRenderer, Select } from "@blueprintjs/select";
import { l } from "@r2c/extension/analytics";
import { ApiFetch } from "@r2c/extension/api/fetch";
import {
  PackageEntry,
  PackageResponse,
  packageUrl
} from "@r2c/extension/api/package";
import { MainToaster } from "@r2c/extension/content/Toaster";
import CopyButton from "@r2c/extension/shared/CopyButton";
import {
  getPreferredPackageManager,
  setPreferredPackageManager
} from "@r2c/extension/utils";
import * as classnames from "classnames";
import * as copy from "copy-to-clipboard";
import { includes, sortBy } from "lodash";
import * as React from "react";
import "./PackageCopyBox.css";

type PackageManagerChoice = "npm" | "yarn";

interface RepoPackageSectionState {
  packageManager: PackageManagerChoice;
  selectedPackage: PackageEntry | undefined;
}

const PackageSelect = Select.ofType<PackageEntry>();

export default class RepoPackageSection extends React.Component<
  {},
  RepoPackageSectionState
> {
  public DEFAULT_PACKAGE_MANAGER: PackageManagerChoice = "npm";

  public state: RepoPackageSectionState = {
    packageManager: this.DEFAULT_PACKAGE_MANAGER,
    selectedPackage: undefined
  };

  private packageFieldRef: { [key: string]: HTMLInputElement | null } = {};

  public componentDidMount() {
    this.fetchPreferredPackageManager();
  }

  public render() {
    const { selectedPackage } = this.state;

    return (
      <ApiFetch<PackageResponse>
        url={packageUrl()}
        onDataChange={this.handleDataChanged}
      >
        {({ loading, data, error }) => (
          <section className="package-copy-box">
            {loading && (
              <NonIdealState
                icon="globe"
                title="Loading..."
                className={classnames({ [Classes.SKELETON]: loading })}
              />
            )}
            {data &&
              data.packages.length === 0 && (
                <NonIdealState icon="box" description="Not published to npm" />
              )}
            {data &&
              data.packages.length > 0 && (
                <>
                  <header>
                    <div className="package-action-description">
                      <h2>
                        Install with{" "}
                        {this.state.packageManager === "npm" ? "npm" : "Yarn"}
                      </h2>
                      <p>
                        Save time and{" "}
                        <a
                          href="https://blog.npmjs.org/post/163723642530/crossenv-malware-on-the-npm-registry"
                          title="Information about and example of typosquatting"
                        >
                          avoid typos
                        </a>{" "}
                        using this command.
                      </p>
                    </div>
                    <div className="package-registry-toggle">
                      {this.state.packageManager === "npm" ? (
                        <a
                          onClick={l(
                            "choose-package-manager",
                            this.handleRegistryChange("yarn"),
                            {
                              oldPackageManager: this.state.packageManager,
                              newChoice: "yarn"
                            }
                          )}
                          role="button"
                        >
                          Use Yarn
                        </a>
                      ) : (
                        <a
                          onClick={l(
                            "choose-package-manager",
                            this.handleRegistryChange("npm"),
                            {
                              oldPackageManager: this.state.packageManager,
                              newChoice: "npm"
                            }
                          )}
                          role="button"
                        >
                          Use npm
                        </a>
                      )}
                    </div>
                  </header>
                  <div className="nutrition-section-value">
                    {selectedPackage && (
                      <div className="nutrition-package">
                        <InputGroup
                          type="text"
                          value={this.buildInstallCommand(
                            this.state.packageManager,
                            selectedPackage.name
                          )}
                          rightElement={
                            <CopyButton
                              onClick={l(
                                "copy-package-button-click",
                                this.handleCopy(
                                  this.state.packageManager,
                                  selectedPackage.name
                                ),
                                {
                                  packageManager: this.state.packageManager,
                                  name: selectedPackage.name
                                }
                              )}
                            />
                          }
                          onClick={l("copy-package-input-click")}
                          className={classnames(
                            Classes.FILL,
                            "package-npm-field"
                          )}
                          inputRef={this.setPackageFieldRef(
                            this.state.packageManager,
                            selectedPackage.name
                          )}
                          readOnly={true}
                        />
                      </div>
                    )}
                    <ButtonGroup
                      className={classnames(
                        "package-copy-other-actions",
                        Classes.FILL
                      )}
                    >
                      <PackageSelect
                        items={data.packages}
                        itemListPredicate={this.filterPackageList}
                        itemRenderer={this.renderPackageSelectEntry}
                        onItemSelect={this.handlePackageSelect}
                        popoverProps={{
                          position: Position.BOTTOM_LEFT,
                          minimal: true,
                          popoverClassName: "package-select-menu",
                          className: "package-select-dropdown-wrapper",
                          targetClassName: "package-select-dropdown-target"
                        }}
                      >
                        <Button
                          className="package-select-dropdown-button"
                          rightIcon={IconNames.CARET_DOWN}
                          minimal={true}
                          text="Choose another..."
                          intent={Intent.PRIMARY}
                        />
                      </PackageSelect>
                      <AnchorButton
                        className="package-npm-link-button"
                        minimal={true}
                        href={
                          selectedPackage != null
                            ? this.buildPackageLink(selectedPackage.name)
                            : undefined
                        }
                        disabled={selectedPackage == null}
                        rightIcon={IconNames.SHARE}
                        intent={Intent.PRIMARY}
                      >
                        See on npm
                      </AnchorButton>
                    </ButtonGroup>
                  </div>
                </>
              )}
          </section>
        )}
      </ApiFetch>
    );
  }

  private renderPackageSelectEntry: ItemRenderer<PackageEntry> = (
    pkg,
    { handleClick, modifiers, query }
  ) => (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      label={renderShortRank(pkg.package_rank)}
      key={`${pkg.registry}/${pkg.name}`}
      onClick={handleClick}
      text={pkg.name}
    />
  );

  private filterPackageList: ItemListPredicate<PackageEntry> = (query, items) =>
    items.filter(item => includes(item.name, query));

  private handlePackageSelect = (pkg: PackageEntry) =>
    this.setState({ selectedPackage: pkg });

  private handleDataChanged = (data: PackageResponse) => {
    const sortedPackages = sortBy(data.packages, ["package_rank", "name"]);
    this.setState({ selectedPackage: sortedPackages[0] });

    return {
      ...data,
      packages: sortedPackages
    };
  };

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
    MainToaster.show({
      message: "Copied to clipboard",
      icon: IconNames.CLIPBOARD
    });

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

export function renderShortRank(rank: number): string {
  if (rank > 10000) {
    return ">10k";
  } else if (rank >= 1000) {
    return `Top ${(rank / 1000).toLocaleString()}k`;
  } else {
    return `Top ${rank.toLocaleString()}`;
  }
}
