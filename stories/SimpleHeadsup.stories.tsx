import {
  ErrorHeadsUp,
  LoadingHeadsUp,
  UnsupportedHeadsUp
} from "@r2c/extension/content/headsup/NonIdealHeadsup";
import { OverrideHeadsupWrapper } from "@r2c/extension/content/headsup/OverrideHeadsup";
import { ERROR_UNKNOWN } from "@r2c/extension/content/headsup/PreflightProjectState";
import SimpleHeadsup from "@r2c/extension/content/headsup/SimpleHeadsup";
import {
  CheckmarkIcon,
  DangerIcon,
  MissingIcon,
  WarningIcon
} from "@r2c/extension/icons";
import { MarkdownString } from "@r2c/extension/utils";
import centered from "@storybook/addon-centered";
import { storiesOf } from "@storybook/react";
import * as React from "react";

storiesOf("SimpleHeadsup", module)
  .addDecorator(centered)
  .add("Non-ideal, loading", () => <LoadingHeadsUp />)
  .add("Non-ideal, error, Error()", () => (
    <ErrorHeadsUp
      projectState={ERROR_UNKNOWN}
      error={new Error("Example error")}
    />
  ))
  .add("Non-ideal, unsupported", () => <UnsupportedHeadsUp />)
  .add("Simple, default", () => (
    <SimpleHeadsup
      isExpanded={false}
      status="safe"
      icon={<MissingIcon />}
      headline="Missing or unknown Preflight data."
    />
  ))
  .add("Simple, blacklist", () => (
    <SimpleHeadsup
      isExpanded={false}
      status="safe"
      icon={<DangerIcon />}
      headline="Malicious Package"
    />
  ))
  .add("Simple, whitelist", () => (
    <SimpleHeadsup
      isExpanded={false}
      status="safe"
      icon={<CheckmarkIcon />}
      headline="All Preflight checks pass."
    />
  ))
  .add("Simple, warning", () => (
    <SimpleHeadsup
      isExpanded={false}
      status="safe"
      icon={<WarningIcon />}
      headline="Some Preflight checks fail."
    />
  ))
  .add("Simple wrapper, promote", () => (
    <OverrideHeadsupWrapper
      override={{
        headline: "Trusted package" as MarkdownString,
        overrideType: "promote",
        reportedAt: "2018-11-26T13:26:00-08:00",
        reporter: "https://github.com/FallingSnow"
      }}
    >
      <h1>foo</h1>
    </OverrideHeadsupWrapper>
  ));
