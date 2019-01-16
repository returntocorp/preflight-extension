import { Popover, Position } from "@blueprintjs/core";
import { buildLineNoElemIdForBlobLine } from "@r2c/extension/content/github/BlobFindingsInjector";
import DOMInjector from "@r2c/extension/content/github/DomInjector";
import { ExtractedRepoSlug } from "@r2c/extension/utils";
import * as classNames from "classnames";
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

interface CriteriaSpan {
  height: number;
  top: number;
  bottom: number;
  leftMargin: number;
  leftGutter: number;
  rightMargin: number;
  startGutterElem: Element;
  startCodeElem: Element;
  endGutterElem: Element;
  endCodeElem: Element;
}

/*
  TODO: write a fetch for criteria, that will fetch as we iterate through package names

*/

export default class PackageCriteriaHighlight extends React.PureComponent<
  PackageCriteriaDetailsProps
> {
  public render() {
    // const { criteria, repoSlug } = this.props;
    const packageInfos: PackageInfo[] = this.computePackageInfo();

    console.log(packageInfos);

    const criteriaSpan = this.computeCriteriaSpan(packageInfos);

    if (criteriaSpan == null || criteriaSpan.startGutterElem == null) {
      return null;
    }

    return (
      <DOMInjector
        destination={criteriaSpan.startGutterElem}
        childClassName="r2c-blob-finding-highlight-wrapper"
        injectedClassName="r2c-blob-finding-highlight"
        relation="direct"
      >
        <Popover
          className="r2c-blob-finding-highlight-wrapper"
          content={<>Hello</>}
          position={Position.RIGHT_TOP}
          minimal={true}
          modifiers={{
            preventOverflow: { boundariesElement: "viewport" },
            offset: { offset: "0px,40px" }
          }}
          defaultIsOpen={false}
        >
          <div className="r2c-blob-finding-highlight-hitbox">
            <div
              className={classNames(
                "finding-highlight-marker",
                "marker-commit-match"
              )}
            />
          </div>
        </Popover>
      </DOMInjector>
    );
  }

  private computeCriteriaSpan = (
    packageInfos: PackageInfo[]
  ): CriteriaSpan | null => {
    if (packageInfos) {
      for (const packageInfo of packageInfos) {
        if (packageInfo.startLine == null) {
          return null;
        }
        const lineGutter = document.querySelector(
          buildLineNoElemIdForBlobLine(packageInfo.startLine)
        );
        const lineCode = document.querySelector(
          buildLineNoElemIdForBlobLine(packageInfo.startLine)
        );

        if (lineGutter == null || lineCode == null) {
          return null;
        }

        const endLineBounds = lineGutter.getBoundingClientRect();
        const startLineBounds = lineGutter.getBoundingClientRect();
        const startCodeBounds = lineCode.getBoundingClientRect();

        return {
          height: endLineBounds.bottom - startLineBounds.top,
          top: startLineBounds.top + window.scrollY,
          bottom: endLineBounds.bottom + window.scrollY,
          leftMargin: startLineBounds.left,
          leftGutter: startLineBounds.right,
          rightMargin: startCodeBounds.right,
          startCodeElem: lineCode,
          startGutterElem: lineGutter,
          endCodeElem: lineCode,
          endGutterElem: lineGutter
        };
      }
    }

    return null;
  };

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
          !packageName.toUpperCase().includes("DEPENDENCIES") &&
          code[0].getAttribute("data-line-number") != null
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

// class PackageCriteriaHighlighter extends React.PureComponent<
//   PackageCriteriaHighlighterProps
// > {
//   public render() {}
// }
