import { AnchorButton, Classes, Icon, MenuItem } from "@blueprintjs/core";
import {
  ItemListRenderer,
  ItemPredicate,
  ItemRenderer,
  Select
} from "@blueprintjs/select";
import { ApiFetch } from "@r2c/extension/api/fetch";
import {
  PackageEntry,
  RelatedPackageEntry,
  RelatedPackagesResponse,
  relatedPackagesUrl
} from "@r2c/extension/api/package";
import * as classnames from "classnames";
import * as React from "react";
import { AutoSizer, List as VList, ListRowRenderer } from "react-virtualized";
import "./RelatedPackages.css";

interface PluralizedListProps<T> {
  items: T[];
  className?: string;
  empty: React.ReactNode;
  children(toRender: T): React.ReactNode;
  onMoreItemClick(item: T): void;
  selectItemLabel?(item: T): string;
  selectItemContent(item: T): string;
}

type WithKey<T> = T & { _pluralizedListKey?: string };

class PluralizedList<T> extends React.PureComponent<PluralizedListProps<T>> {
  private NUM_PREVIEW_PACKAGES = 3;

  public render() {
    const { items, empty, className, children } = this.props;

    if (items.length === 0) {
      return empty;
    } else if (items.length === 1) {
      return children(items[0]);
    } else if (items.length === 2) {
      return (
        <span className={classnames("pluralized-list", className)}>
          {children(items[0])} and {children(items[1])}
        </span>
      );
    } else {
      const numPreview = Math.min(this.NUM_PREVIEW_PACKAGES, items.length - 1);

      return (
        <span className={classnames("pluralized-list", className)}>
          {items.slice(0, numPreview).map((item, i) => (
            <span key={i} className="pluralized-list-preview-item">
              {children(item)},{" "}
            </span>
          ))}{" "}
          and{" "}
          {items.length === this.NUM_PREVIEW_PACKAGES ? (
            <span className="pluralized-list-last">
              {children(items[items.length - 1])}
            </span>
          ) : (
            <Select<WithKey<T>>
              items={items}
              itemPredicate={this.filterItems}
              itemRenderer={this.renderItem}
              itemListRenderer={this.renderItemList}
              onItemSelect={this.handleItemSelect}
              className="pluralized-list-more-select"
              popoverProps={{
                popoverClassName: "pluralized-list-more-select-popover",
                minimal: true
              }}
            >
              <AnchorButton
                className="pluralized-list-more-button"
                minimal={true}
                small={true}
              >
                {items.length - this.NUM_PREVIEW_PACKAGES} more
              </AnchorButton>
            </Select>
          )}
        </span>
      );
    }
  }

  private renderItem: ItemRenderer<WithKey<T>> = (
    item,
    { handleClick, modifiers, index }
  ) => {
    const { selectItemContent, selectItemLabel } = this.props;

    console.log(item, item._pluralizedListKey);

    return (
      <MenuItem
        active={modifiers.active}
        disabled={modifiers.disabled}
        key={
          item._pluralizedListKey != null
            ? item._pluralizedListKey
            : selectItemContent(item)
        }
        onClick={handleClick}
        label={selectItemLabel != null ? selectItemLabel(item) : undefined}
        text={selectItemContent(item)}
      />
    );
  };

  private renderVirtualizedItem: (
    items: T[],
    renderFunc: (item: WithKey<T>, index: number) => JSX.Element | null
  ) => ListRowRenderer = (items, renderFunc) => ({ index, key }) => {
    // Can't use object spread because TypeScript complains that T is not of type object
    // tslint:disable-next-line:prefer-object-spread
    const withKey = Object.assign({}, items[index], {
      _pluralizedListKey: key
    }) as WithKey<T>;

    return renderFunc(withKey, index);
  };

  private renderItemList: ItemListRenderer<WithKey<T>> = ({
    items,
    itemsParentRef,
    query,
    renderItem
  }) => {
    return (
      <AutoSizer
        disableHeight={true}
        className="pluralized-list-more-vlist-parent"
      >
        {({ width }) => (
          <VList
            height={Math.min(items.length * 30, 300)}
            width={width}
            rowCount={items.length}
            rowRenderer={this.renderVirtualizedItem(items, renderItem)}
            rowHeight={30}
            className="pluralized-list-more-vlist"
          />
        )}
      </AutoSizer>
    );
  };

  private filterItems: ItemPredicate<T> = (query, item, index) => {
    return this.props.selectItemContent(item).indexOf(query) >= 0;
  };

  private handleItemSelect = (
    item: T,
    event: React.SyntheticEvent<HTMLElement> | undefined
  ) => {
    this.props.onMoreItemClick(item);
  };
}

interface RelatedPackagesListProps {
  relatedPackages: RelatedPackageEntry[] | undefined;
}

export class RelatedPackagesList extends React.PureComponent<
  RelatedPackagesListProps
> {
  public render() {
    const { relatedPackages } = this.props;

    if (relatedPackages == null) {
      return null;
    } else {
      return (
        <PluralizedList
          empty={
            <div className="nonideal-inline">
              <Icon icon="heart-broken" className="nonideal-inline-icon" /> No
              related packages
            </div>
          }
          items={relatedPackages}
          selectItemContent={this.selectPackageContent}
          onMoreItemClick={this.handlePackageListClick}
        >
          {item => (
            <a href={item.sourceUrl} rel="noreferer noopener">
              {item.related}
            </a>
          )}
        </PluralizedList>
      );
    }
  }

  private selectPackageContent = (entry: RelatedPackageEntry) => entry.related;

  private handlePackageListClick = (entry: RelatedPackageEntry) =>
    window.open(entry.sourceUrl);
}

interface RelatedPackagesProps {
  selectedPackage: PackageEntry;
}

export default class RelatedPackages extends React.PureComponent<
  RelatedPackagesProps
> {
  public render() {
    const { selectedPackage } = this.props;

    return (
      <ApiFetch<RelatedPackagesResponse> url={relatedPackagesUrl()}>
        {({ loading, data, error }) => (
          <section className="related-packages-container">
            <header className={classnames({ [Classes.SKELETON]: loading })}>
              <h2>Project used with</h2>
            </header>
            <div
              className={classnames("related-packages-list", {
                [Classes.SKELETON]: loading
              })}
            >
              {data != null && (
                <RelatedPackagesList
                  relatedPackages={data.related[selectedPackage.name]}
                />
              )}
            </div>
          </section>
        )}
      </ApiFetch>
    );
  }
}
