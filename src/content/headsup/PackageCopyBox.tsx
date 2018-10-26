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
import { PackageEntry, PackageResponse } from "@r2c/extension/api/package";
import { MainToaster } from "@r2c/extension/content/Toaster";
import CopyButton from "@r2c/extension/shared/CopyButton";
import {
  buildPackageLink,
  getPreferredPackageManager,
  setPreferredPackageManager
} from "@r2c/extension/utils";
import * as classnames from "classnames";
import * as copy from "copy-to-clipboard";
import { includes } from "lodash";
import * as React from "react";
import "./PackageCopyBox.css";

type PackageManagerChoice = "npm" | "yarn";

interface PackageCopyBoxProps {
  packages: PackageResponse;
  selectedPackage: PackageEntry;
  packageManager: PackageManagerChoice;
  onSelectPackage(
    newPackage: PackageEntry
  ): React.MouseEventHandler<HTMLElement>;
  onChangePackageManager(
    newManager: PackageManagerChoice
  ): React.MouseEventHandler<HTMLElement>;
}

const PackageSelect = Select.ofType<PackageEntry>();

export class PackageCopyBox extends React.PureComponent<PackageCopyBoxProps> {
  private packageFieldRef: { [key: string]: HTMLInputElement | null } = {};

  public render() {
    const {
      packages,
      selectedPackage,
      packageManager,
      onSelectPackage,
      onChangePackageManager
    } = this.props;

    return (
      <section className="package-copy-box">
        <header>
          <div className="package-action-description">
            <h2>
              Install package with {packageManager === "npm" ? "npm" : "Yarn"}
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
            {packageManager === "npm" ? (
              <a
                onClick={l(
                  "choose-package-manager",
                  onChangePackageManager("yarn"),
                  {
                    oldPackageManager: packageManager,
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
                  onChangePackageManager("npm"),
                  {
                    oldPackageManager: packageManager,
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
                value={buildInstallCommand(
                  packageManager,
                  selectedPackage.name
                )}
                rightElement={
                  <CopyButton
                    onClick={l(
                      "copy-package-button-click",
                      this.handleCopy(packageManager, selectedPackage.name),
                      {
                        packageManager: packageManager,
                        name: selectedPackage.name
                      }
                    )}
                  />
                }
                onClick={l("copy-package-input-click")}
                className={classnames(Classes.FILL, "package-npm-field")}
                inputRef={this.setPackageFieldRef(
                  packageManager,
                  selectedPackage.name
                )}
                readOnly={true}
              />
            </div>
          )}
          <ButtonGroup
            className={classnames("package-copy-other-actions", Classes.FILL)}
          >
            <PackageSelect
              items={packages.packages}
              itemListPredicate={this.filterPackageList}
              itemRenderer={this.renderPackageSelectEntry}
              onItemSelect={onSelectPackage}
              popoverProps={{
                position: Position.BOTTOM_LEFT,
                minimal: true,
                popoverClassName: "package-select-menu",
                className: "package-select-dropdown-wrapper",
                targetClassName: "package-select-dropdown-target",
                portalClassName: "package-select-portal",
                modifiers: {
                  preventOverflow: {
                    enabled: false,
                    escapeWithReference: false,
                    boundariesElement: "viewport"
                  },
                  flip: { enabled: false }
                }
              }}
            >
              <Button
                className="package-select-dropdown-button"
                rightIcon={IconNames.CARET_DOWN}
                minimal={true}
                text="Change package"
                intent={Intent.PRIMARY}
              />
            </PackageSelect>
            <AnchorButton
              className="package-npm-link-button"
              minimal={true}
              href={
                selectedPackage != null
                  ? buildPackageLink(selectedPackage.name)
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
      </section>
    );
  }

  private handleCopy = (registry: string, packageName: string) => (
    e: React.MouseEvent<HTMLElement>
  ) => {
    const key = this.buildPackageFieldRefKey(registry, packageName);
    const toCopy = this.packageFieldRef[key];

    if (toCopy != null) {
      toCopy.focus();
      toCopy.setSelectionRange(0, toCopy.value.length);
      this.copyToClipboard(buildInstallCommand(registry, packageName));
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

  private buildPackageFieldRefKey = (
    registry: string,
    packageName: string
  ): string => `${registry}/${packageName}`;
}

interface WrappedPackageCopyBoxProps {
  packages: PackageResponse | undefined;
  selectedPackage?: PackageEntry;
  packageManager?: PackageManagerChoice;
  onSelectPackage?(newPackage: PackageEntry): void;
  onChangePackageManager?(newManager: PackageManagerChoice): void;
}

interface WrappedPackageCopyBoxState {
  controlSelectedPackage: boolean;
  selectedPackage: PackageEntry | undefined;
  controlPackageManager: boolean;
  packageManager: PackageManagerChoice;
}

export default class WrappedPackageCopyBox extends React.Component<
  WrappedPackageCopyBoxProps,
  WrappedPackageCopyBoxState
> {
  public DEFAULT_PACKAGE_MANAGER: PackageManagerChoice = "npm";

  public constructor(props: WrappedPackageCopyBoxProps) {
    super(props);
    this.state = {
      controlSelectedPackage: props.selectedPackage != null,
      selectedPackage: props.selectedPackage || undefined,
      controlPackageManager: props.packageManager != null,
      packageManager: props.packageManager || this.DEFAULT_PACKAGE_MANAGER
    };
  }

  public componentDidMount() {
    this.fetchPreferredPackageManager();

    // Race condition may cause data to be loaded already, so we need to set
    // defaults on both mount and update
    this.setDefaultSelectedPackage();
  }

  public componentDidUpdate(prevProps: WrappedPackageCopyBoxProps) {
    if (
      this.state.controlPackageManager &&
      this.props.packageManager != null &&
      this.props.packageManager !== prevProps.packageManager
    ) {
      this.changePackageManager(this.props.packageManager);
    }

    if (
      this.state.controlSelectedPackage &&
      this.props.selectedPackage != null &&
      this.props.selectedPackage !== prevProps.selectedPackage
    ) {
      this.selectPackage(this.props.selectedPackage);
    }

    this.setDefaultSelectedPackage();
  }

  public render() {
    const { packages: data } = this.props;

    const { selectedPackage, packageManager } = this.state;

    if (data == null || data.packages.length === 0) {
      return (
        <section className="package-copy-box">
          <NonIdealState icon="box" description="Not published to npm" />
        </section>
      );
    } else if (selectedPackage == null) {
      return (
        <section className="package-copy-box">
          <NonIdealState icon="box" description="No packages to pick from" />
        </section>
      );
    } else {
      return (
        <PackageCopyBox
          packages={data}
          selectedPackage={selectedPackage}
          packageManager={packageManager}
          onSelectPackage={this.handlePackageSelect}
          onChangePackageManager={this.handlePackageManagerChange}
        />
      );
    }
  }

  private fetchPreferredPackageManager = async () => {
    const packageManager = (await getPreferredPackageManager()) as PackageManagerChoice;
    if (packageManager != null) {
      this.setState({
        packageManager: packageManager || this.DEFAULT_PACKAGE_MANAGER
      });
    }
  };

  private handlePackageSelect = (pkg: PackageEntry) => (
    e: React.MouseEvent<HTMLElement>
  ) => this.selectPackage(pkg);

  private selectPackage = (pkg: PackageEntry) => {
    if (this.props.onSelectPackage != null) {
      this.props.onSelectPackage(pkg);
    }

    if (!this.state.controlSelectedPackage) {
      this.setState({ selectedPackage: pkg });
    }
  };

  private handlePackageManagerChange = (
    packageManager: PackageManagerChoice
  ) => (e: React.MouseEvent<HTMLElement>) =>
    this.changePackageManager(packageManager);

  private changePackageManager = (packageManager: PackageManagerChoice) => {
    if (this.props.onChangePackageManager != null) {
      this.props.onChangePackageManager(packageManager);
    }

    if (!this.state.controlPackageManager) {
      this.setState({ packageManager });
      setPreferredPackageManager(packageManager);
    }
  };

  private setDefaultSelectedPackage = () => {
    if (
      !this.state.controlSelectedPackage &&
      this.state.selectedPackage == null &&
      this.props.packages != null &&
      this.props.packages.packages.length > 0
    ) {
      this.selectPackage(this.props.packages.packages[0]);
    }
  };
}

function renderShortRank(rank: number): string {
  if (rank > 10000) {
    return ">10k";
  } else if (rank >= 1000) {
    return `Top ${(rank / 1000).toLocaleString()}k`;
  } else {
    return `Top ${rank.toLocaleString()}`;
  }
}

function buildInstallCommand(
  registry: string,
  packageName: string,
  dev: boolean = false
): string {
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
}
