import { OverrideType } from "@r2c/extension/api/package";
import {
  ErrorHeadsUp,
  LoadingHeadsUp,
  UnsupportedHeadsUp
} from "@r2c/extension/content/headsup/NonIdealHeadsup";
import OverrideHeadsup, {
  OverrideHeadsupWrapper
} from "@r2c/extension/content/headsup/OverrideHeadsup";
import { ERROR_UNKNOWN } from "@r2c/extension/content/headsup/PreflightProjectState";
import { MarkdownString } from "@r2c/extension/utils";
import { action } from "@storybook/addon-actions";
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
  .add("Override, default", () => (
    <OverrideHeadsup
      override={{
        headline: "Something else" as MarkdownString,
        overrideType: "something-else" as OverrideType,
        reportedAt: "2018-11-26T13:26:00-08:00",
        reporter: "https://github.com/FallingSnow"
      }}
      onShowAnywaysClick={action("show anyways clicked")}
      onReportClick={action("report issue clicked")}
    />
  ))
  .add("Override, blacklist", () => (
    <OverrideHeadsup
      override={{
        headline: "Malicious package. See [dominictarr/event-stream#116](https://github.com/dominictarr/event-stream/issues/116)" as MarkdownString,
        overrideType: "blacklist",
        reportedAt: "2018-11-26T13:26:00-08:00",
        reporter: "https://github.com/FallingSnow"
      }}
      onShowAnywaysClick={action("show anyways clicked")}
      onReportClick={action("report issue clicked")}
    />
  ))
  .add("Override, whitelist", () => (
    <OverrideHeadsup
      override={{
        headline: "Package passes all checks" as MarkdownString,
        overrideType: "whitelist",
        reportedAt: "2018-11-26T13:26:00-08:00",
        reporter: "https://github.com/FallingSnow"
      }}
      onShowAnywaysClick={action("show anyways clicked")}
      onReportClick={action("report issue clicked")}
    />
  ))
  .add("Override, promote", () => (
    <OverrideHeadsup
      override={{
        headline: "Trusted package" as MarkdownString,
        overrideType: "promote",
        reportedAt: "2018-11-26T13:26:00-08:00",
        reporter: "https://github.com/FallingSnow"
      }}
      onShowAnywaysClick={action("show anyways clicked")}
      onReportClick={action("report issue clicked")}
    />
  ))
  .add("Override wrapper, promote", () => (
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
