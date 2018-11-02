import { fetchJson } from "@r2c/extension/api/fetch";
import * as React from "react";

// tslint:disable-next-line:no-any
type EventHandlerTodo = any;
type LoggingProperties = {};

// tslint:disable-next-line:function-name
export const l = (
  name: string,
  handler?: React.EventHandler<EventHandlerTodo>,
  properties?: LoggingProperties
): typeof handler => e => {
  logEvent(name, properties);

  if (handler != null) {
    handler(e);
  }
};

export const li = (name: string, properties?: LoggingProperties) => {
  logEvent(name, properties);
};

function logEvent(name: string, properties?: LoggingProperties) {
  const body = {
    name,
    properties
  };

  fetchJson(`https://api.secarta.io/logger`, {
    method: "POST",
    body: JSON.stringify(body)
  });
}
