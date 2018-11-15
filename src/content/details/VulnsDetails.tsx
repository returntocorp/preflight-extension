import { VulnsResponse } from "@r2c/extension/api/vulns";
import VulnEntry from "@r2c/extension/content/details/VulnEntry";
import * as React from "react";

interface VulnsDetailsProps {
  data: VulnsResponse;
}

export default class VulnsDetails extends React.PureComponent<
  VulnsDetailsProps
> {
  public render() {
    const { data } = this.props;

    if (data != null) {
      return (
        <>
          {data.vuln.map(
            (vulns, entriesIdx) =>
              vulns != null &&
              vulns.vuln.map(vuln => <VulnEntry vuln={vuln} key={vuln.slug} />)
          )}
        </>
      );
    } else {
      return null;
    }
  }
}
