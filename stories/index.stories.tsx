import {
  ErrorHeadsUp,
  LoadingHeadsUp
} from "@r2c/extension/content/headsup/NonIdealHeadsup";
import centered from "@storybook/addon-centered";
import { storiesOf } from "@storybook/react";
import * as React from "react";

storiesOf("Headsup", module)
  .addDecorator(centered)
  .add("Non-ideal, loading", () => <LoadingHeadsUp />)
  .add("Non-ideal, error, Error()", () => (
    <ErrorHeadsUp error={new Error("Example error")} />
  ));
