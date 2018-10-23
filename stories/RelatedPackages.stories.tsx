import { RelatedPackageEntry } from "@r2c/extension/api/package";
import { RelatedPackagesList } from "@r2c/extension/content/headsup/RelatedPackages";
import centered from "@storybook/addon-centered";
import { storiesOf } from "@storybook/react";
import * as React from "react";

const relatedPackages: RelatedPackageEntry[] = [
  {
    occurs: 50000,
    related: "lodash"
  },
  {
    occurs: 4000,
    related: "react"
  },
  {
    occurs: 300,
    related: "vue"
  },
  {
    occurs: 20,
    related: "left-pad"
  },
  {
    occurs: 1,
    related: "typescript"
  }
];

storiesOf("RelatedPackagesList", module)
  .addDecorator(centered)
  .add("Package not found", () => (
    <RelatedPackagesList relatedPackages={undefined} />
  ))
  .add("No package", () => <RelatedPackagesList relatedPackages={[]} />)
  .add("1 package", () => (
    <RelatedPackagesList relatedPackages={relatedPackages.slice(0, 1)} />
  ))
  .add("2 packages", () => (
    <RelatedPackagesList relatedPackages={relatedPackages.slice(0, 2)} />
  ))
  .add("3 packages", () => (
    <RelatedPackagesList relatedPackages={relatedPackages.slice(0, 3)} />
  ))
  .add("all packages", () => (
    <RelatedPackagesList relatedPackages={relatedPackages} />
  ));
