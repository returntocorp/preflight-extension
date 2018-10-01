// Fork https://github.com/nhagen/react-intercom to TypeScript

import * as React from "react";

declare global {
  interface Window {
    Intercom: typeof Intercom;
  }
}

const canUseDOM = !!(
  window != null &&
  window.document &&
  window.document.createElement
);

export const IntercomAPI: typeof Intercom = (args: unknown) => {
  if (canUseDOM && window.Intercom) {
    return window.Intercom.apply(null, args);
  } else {
    console.warn("Intercom not initialized yet");
  }
};

interface IntercomHookProps extends Intercom_.IntercomSettings {
  appId?: string;
  custom_launcher_selector?: string;
}

export default class IntercomHook extends React.Component<IntercomHookProps> {
  public static DEFAULT_APP_ID = "hw956jn7";

  constructor(props: IntercomHookProps) {
    super(props);

    const { appId = IntercomHook.DEFAULT_APP_ID, ...otherProps } = props;

    if (!appId || !canUseDOM) {
      return;
    }

    if (!window.Intercom) {
      ((w, d, id) => {
        function intercom() {
          intercom.c(arguments);
        }
        // tslint:disable:no-any
        intercom.q = [] as any[];
        intercom.c = (args: any) => {
          intercom.q.push(args);
        };
        (w.Intercom as any) = intercom;
        // tslint:enable:no-any
        const s = d.createElement("script");
        s.async = true;
        s.src = `https://widget.intercom.io/widget/${id}`;

        if (d.head != null) {
          d.head.appendChild(s);
        } else if (d.body != null) {
          d.body.appendChild(s);
        }
      })(window, document, appId);
    }

    window.intercomSettings = { ...otherProps, app_id: appId };

    if (window.Intercom) {
      window.Intercom("boot", otherProps);
    }
  }

  public componentDidUpdate() {
    const { appId, children, ...otherProps } = this.props;

    if (!canUseDOM) {
      return;
    }

    // tslint:disable-next-line:no-any
    (window.intercomSettings as any) = { ...otherProps, app_id: appId };

    if (window.Intercom) {
      window.Intercom("update", otherProps);
    }
  }

  public shouldComponentUpdate() {
    return false;
  }

  public componentWillUnmount() {
    if (!canUseDOM || !window.Intercom) {
      return false;
    }

    window.Intercom("shutdown");

    delete window.Intercom;

    return;
  }

  public render() {
    return false;
  }
}
