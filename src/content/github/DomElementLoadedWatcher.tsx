import * as React from "react";

interface DomElementLoadedProps {
  querySelector: string | string[];
  retryInterval?: number;
  children(state: DomElementLoadedState): React.ReactNode;
}

interface DomElementLoadedState {
  timedOut: boolean;
  waiting: boolean;
  done: boolean;
  element: Element | undefined;
  elements: Element[] | undefined;
}

export default class DomElementLoadedWatcher extends React.Component<
  DomElementLoadedProps,
  DomElementLoadedState
> {
  public static defaultProps = {
    retryInterval: 100
  };

  public state: DomElementLoadedState = {
    timedOut: false,
    waiting: false,
    done: false,
    element: undefined,
    elements: undefined
  };

  private queryPollInterval: number | null = null;

  private DEFAULT_RETRIES = 50;
  private retries = 0;

  public componentDidMount() {
    this.startQueryPoll();
  }

  public componentDidUpdate(prevProps: DomElementLoadedProps) {
    if (this.props.querySelector !== prevProps.querySelector) {
      this.retries = 0;
      this.stopQueryPoll();
      this.startQueryPoll();
    }
  }

  public componentWillUnmount() {
    this.stopQueryPoll();
  }

  public render() {
    return this.props.children(this.state);
  }

  private startQueryPoll = () => {
    if (this.queryPollInterval == null) {
      this.queryPollInterval = setInterval(
        this.pollForQuerySelector,
        this.props.retryInterval
      );
    }
  };

  private stopQueryPoll = () => {
    if (this.queryPollInterval != null) {
      clearInterval(this.queryPollInterval);
      this.queryPollInterval = null;
    }
  };

  private pollForQuerySelector = () => {
    this.retries += 1;
    if (this.retries > this.DEFAULT_RETRIES) {
      this.setState({
        timedOut: true,
        waiting: false,
        done: false,
        elements: undefined,
        element: undefined
      });
      this.stopQueryPoll();
    }

    if (Array.isArray(this.props.querySelector)) {
      const elems = this.props.querySelector.map(selector =>
        document.querySelector(selector)
      );

      if (elems != null && elems.every(elem => elem != null)) {
        this.stopQueryPoll();
        this.setState({
          waiting: false,
          done: true,
          elements: elems as Element[],
          element: elems[0] as Element
        });
      } else if (this.state.done || !this.state.waiting) {
        this.setState({
          waiting: true,
          done: false,
          element: undefined,
          elements: undefined
        });
      }
    } else {
      const elem = document.querySelector(this.props.querySelector);

      if (elem != null) {
        this.stopQueryPoll();
        this.setState({ waiting: false, done: true, element: elem });
      } else if (this.state.done || !this.state.waiting) {
        this.setState({ waiting: true, done: false, element: undefined });
      }
    }
  };
}
