import { Button, Spinner, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { PreflightChecklistItemType } from "@r2c/extension/content/headsup/PreflightChecklist";
import * as classnames from "classnames";
import * as React from "react";

interface CollapsibleDetailsSectionProps {
  check: PreflightChecklistItemType;
  title: string;
  count?: number;
  description?: string;
  loading?: boolean | null;
  startOpen?: boolean;
  domRef?: React.RefObject<HTMLElement>;
}

interface CollapsibleDetailsSectionState {
  open: boolean | undefined;
}

export default class CollapsibleDetailsSection extends React.PureComponent<
  CollapsibleDetailsSectionProps,
  CollapsibleDetailsSectionState
> {
  public state: CollapsibleDetailsSectionState = {
    open: undefined
  };

  public componentDidUpdate(prevProps: CollapsibleDetailsSectionProps) {
    if (
      this.props.startOpen != null &&
      this.props.startOpen &&
      this.state.open == null
    ) {
      this.setState({ open: true });
    }
  }

  public render() {
    const {
      check,
      title,
      description,
      count,
      children,
      loading,
      domRef
    } = this.props;
    const { open } = this.state;

    return (
      <section
        className={classnames("preflight-section", `preflight-${check}`)}
        ref={domRef}
      >
        <Button
          className={classnames("preflight-section-header")}
          minimal={true}
          fill={true}
          onClick={this.toggleCollapse}
          rightIcon={open ? IconNames.CHEVRON_UP : IconNames.CHEVRON_DOWN}
        >
          <span className="preflight-section-header-text">
            <span className="preflight-section-title">{title}</span>
            {!loading && (
              <Tag
                className="preflight-section-header-count"
                minimal={count == null || count === 0}
                round={true}
              >
                {count || 0}
              </Tag>
            )}
            {loading && <Spinner size={Spinner.SIZE_SMALL} />}
          </span>
        </Button>
        {!loading &&
          open != null &&
          open && (
            <div className="preflight-section-body">
              <p className="preflight-section-description">{description}</p>
              <div className="preflight-section-content">{children}</div>
            </div>
          )}
      </section>
    );
  }

  private toggleCollapse: React.MouseEventHandler<HTMLElement> = e =>
    this.setState({ open: !this.state.open });
}
