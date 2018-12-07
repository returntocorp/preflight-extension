import {
  ErrorHeadsUp,
  LoadingHeadsUp,
  UnsupportedHeadsUp
} from "@r2c/extension/content/headsup/NonIdealHeadsup";
import { ERROR_UNKNOWN } from "@r2c/extension/content/headsup/PreflightProjectState";
import SimpleHeadsup from "@r2c/extension/content/headsup/SimpleHeadsup";
import {
  CheckmarkIcon,
  DangerIcon,
  MissingIcon,
  WarningIcon
} from "@r2c/extension/icons";
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
      status="safe"
      icon={<MissingIcon />}
      headline="Incomplete or unknown Preflight data."
    />
  ))
  .add("Simple, blacklist", () => (
    <SimpleHeadsup
      status="safe"
      icon={<DangerIcon />}
      headline="Malicious Package"
    />
  ))
  .add("Simple, whitelist", () => (
    <SimpleHeadsup
      status="safe"
      icon={<CheckmarkIcon />}
      headline="All Preflight checks pass."
    />
  ))
  .add("Simple, warning", () => (
    <SimpleHeadsup
      status="safe"
      icon={<WarningIcon />}
      headline="Some Preflight checks fail."
    />
  ));
