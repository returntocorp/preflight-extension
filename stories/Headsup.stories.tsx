import ExceptionalHeadsUp from "@r2c/extension/content/headsup/ExceptionalHeadsup";
import {
  ErrorHeadsUp,
  LoadingHeadsUp,
  UnsupportedHeadsUp
} from "@r2c/extension/content/headsup/NonIdealHeadsup";
import { ERROR_UNKNOWN } from "@r2c/extension/content/headsup/PreflightProjectState";
import centered from "@storybook/addon-centered";
import { storiesOf } from "@storybook/react";
import * as React from "react";

storiesOf("Headsup", module)
  .addDecorator(centered)
  .add("Non-ideal, loading", () => <LoadingHeadsUp />)
  .add("Non-ideal, error, Error()", () => (
    <ErrorHeadsUp
      projectState={ERROR_UNKNOWN}
      error={new Error("Example error")}
    />
  ))
  .add("Non-ideal, unsupported", () => <UnsupportedHeadsUp />)
  .add("Exceptional", () => <ExceptionalHeadsUp />);
