import * as React from "react";
import * as ReactDOM from "react-dom";

interface DOMInjectorProps {
  /**
   * The classname of the child being injected
   */
  childClassName: string;

  /**
   * The site to inject the child into
   */
  destination: string | Element;

  /**
   * After injection, add this classname to the destination node
   */
  injectedClassName?: string;

  /**
   * Where to inject the child in relation to the destination
   *
   * "before": as a sibling, before the destination node
   * "after": as a sibling, after the destination node
   * "prependchild": as a child, as the last child of the destination node
   * "appendchild": as a child, as the first child of the destination node
   * "direct": use ReactDOM.createPortal semantics in the destination node
   */
  relation?: "before" | "after" | "prependchild" | "appendchild" | "direct";
}

export default class DOMInjector extends React.PureComponent<DOMInjectorProps> {
  public render() {
    const {
      children,
      childClassName,
      destination,
      injectedClassName,
      relation
    } = this.props;

    const site = this.getElementForDestination(destination);
    const existingElem = document.querySelector(`.${childClassName}`);

    if (site == null) {
      return null;
    }

    if (existingElem != null) {
      existingElem.remove();
    }

    if (injectedClassName != null) {
      site.classList.add(injectedClassName);
    }

    if (relation === "direct") {
      return ReactDOM.createPortal(children, site);
    }

    const injected = document.createElement("div");
    injected.classList.add(childClassName);

    switch (relation) {
      case "after":
      case null:
        site.after(injected);
        break;
      case "before":
        site.before(injected);
        break;
      case "prependchild":
        site.prepend(injected);
        break;
      case "appendchild":
      default:
        site.appendChild(injected);
    }

    return ReactDOM.createPortal(children, injected);
  }

  private getElementForDestination = (
    destination: string | Element
  ): Element | null => {
    if (typeof destination === "string") {
      return document.querySelector(destination);
    } else {
      return destination;
    }
  };
}
