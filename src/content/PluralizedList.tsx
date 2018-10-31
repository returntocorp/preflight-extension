import * as classnames from "classnames";
import * as React from "react";

interface PluralizedListProps<T> {
  items: T[];
  className?: string;
  noItems?: React.ReactNode;
  children(toRender: T): React.ReactNode;
}

export default class PluralizedList<T> extends React.PureComponent<
  PluralizedListProps<T>
> {
  private NUM_PREVIEW_ITEMS = 3;

  public render() {
    const { items, noItems, className, children } = this.props;

    if (items.length === 0) {
      if (noItems != null) {
        return noItems;
      } else {
        return null;
      }
    } else if (items.length === 1) {
      return children(items[0]);
    } else if (items.length === 2) {
      return (
        <span className={classnames("pluralized-list", className)}>
          {children(items[0])} and {children(items[1])}
        </span>
      );
    } else {
      const numPreview = Math.min(this.NUM_PREVIEW_ITEMS, items.length - 1);

      return (
        <span className={classnames("pluralized-list", className)}>
          {items.slice(0, numPreview).map((item, i) => (
            <span key={i} className="pluralized-list-preview-item">
              {children(item)},{" "}
            </span>
          ))}{" "}
          and{" "}
          {items.length === this.NUM_PREVIEW_ITEMS ? (
            <span className="pluralized-list-last">
              {children(items[items.length - 1])}
            </span>
          ) : (
            <span className="pluralized-list-more">
              {items.length - this.NUM_PREVIEW_ITEMS} more
            </span>
          )}
        </span>
      );
    }
  }
}
