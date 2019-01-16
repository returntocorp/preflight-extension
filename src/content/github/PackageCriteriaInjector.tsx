import { ExtractedRepoSlug } from "@r2c/extension/utils";
import * as React from "react";
import "./PackageCriteriaInjector.css";

interface PackageInfo {
  name: string;
  startLine: number | null;
}

// interface PackageCriteriaInjectorProps {
//   criteria: CriteriaEntry[];
//   repoSlug: ExtractedRepoSlug;
// }

// interface PackageCriteriaHighlighterProps extends PackageCriteriaInjectorProps {
//   filePath: string;
//   repoSlug: ExtractedRepoSlug;
// }

interface PackageCriteriaDetailsProps {
  // criteria: CriteriaEntry[];
  repoSlug: ExtractedRepoSlug;
}

// interface CriteriaSpan {
//   height: number;
//   top: number;
//   bottom: number;
//   leftMargin: number;
//   leftGutter: number;
//   rightMargin: number;
//   startGutterElem: Element;
//   startCodeElem: Element;
//   endGutterElem: Element;
//   endCodeElem: Element;
// }

export default class PackageCriteriaHighlight extends React.PureComponent<
  PackageCriteriaDetailsProps
> {
  public render() {
    // const { criteria, repoSlug } = this.props;
    const packageInfos: PackageInfo[] = this.computePackageInfo();

    console.log(packageInfos);

    // const criteriaSpan = this.computeCriteriaSpan();

    // if (criteriaSpan == null || criteriaSpan.startGutterElem == null) {
    //   return null;
    // }

    return <></>;
  }

  // private computeCriteriaSpan = (): CriteriaSpan | null => {};

  private computePackageInfo = (): PackageInfo[] => {
    const packagejson = document.querySelectorAll(
      ".file .blob-wrapper .js-file-line-container tr"
    );
    let hitDependencies = false;
    const packageInfo: PackageInfo[] = [];

    for (const line of Array.from(packagejson)) {
      const code = line.getElementsByTagName("td");

      if (hitDependencies && code[1].getElementsByClassName("pl-s")[0]) {
        const packageName = code[1].getElementsByClassName("pl-s")[0]
          .textContent;
        if (
          packageName &&
          !packageName.toUpperCase().includes("DEPENDENCIES")
        ) {
          packageInfo.push({
            name: packageName.replace(/"/g, ""),

            // tslint:disable-next-line:no-non-null-assertion
            startLine: +code[0].getAttribute("data-line-number")!
          });
        }
      } else {
        if (code[1].textContent) {
          if (code[1].textContent.toUpperCase().includes("DEPENDENCIES")) {
            hitDependencies = true;
          } else if (code[1].textContent.includes("}")) {
            hitDependencies = false;
          }
        }
      }
    }

    return packageInfo;
  };
}
