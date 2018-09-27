import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";

storiesOf("Welcome", module).add("to Storybook", () => (
  <div>Hello world</div>
));

storiesOf("Button", module)
  .add("with text", () => (
    <button onClick={action("clicked")}>Hello button</button>
  ))
  .add("with some emoji", () => (
    <button onClick={action("clicked")}>
      <span role="img" aria-label="so cool">
        😀 😎 👍 💯
      </span>
    </button>
  ));
