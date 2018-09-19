import * as React from "react";
import * as ReactDOM from "react-dom";

interface DOMInjectorProps {
  injectedClassName: string;
  destinationClassName: string;
  position?: "before" | "after";
}

export default class DOMInjector extends React.PureComponent<DOMInjectorProps> {
  public render() {
    const {
      children,
      injectedClassName,
      destinationClassName,
      position
    } = this.props;
    const destination = document.querySelector(`.${destinationClassName}`);
    const existingElem = document.querySelector(`.${injectedClassName}`);

    if (destination == null) {
      return null;
    }

    if (existingElem != null) {
      existingElem.remove();
    }

    const injected = document.createElement("div");
    injected.classList.add(injectedClassName);

    if (position == null || position === "after") {
      destination.after(injected);
    } else if (position === "before") {
      destination.before(injected);
    }

    return ReactDOM.createPortal(children, injected);
  }
}
