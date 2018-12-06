import { buildFetchComponent, RawApiFetch } from "@r2c/extension/api/fetch";
import {
  PermissionsResponse,
  permissionsUrl
} from "@r2c/extension/api/permissions";
import { ExtractedRepoSlug, parseSlugFromUrl } from "@r2c/extension/utils";
import { shallow } from "enzyme";
import * as React from "react";

describe("Fetch wrapper component builder", () => {
  it("constructs a wrapper function as expected", () => {
    const repoSlug: ExtractedRepoSlug = parseSlugFromUrl(
      "https://github.com/returntocorp/preflight-extension"
    );
    const fakeChild = () => null;
    const expected = (
      <RawApiFetch<PermissionsResponse>
        url={permissionsUrl(repoSlug)}
        children={fakeChild}
      />
    );

    const BuiltComponent = buildFetchComponent<PermissionsResponse>(
      permissionsUrl
    );
    const actual = shallow(
      <BuiltComponent children={fakeChild} repoSlug={repoSlug} />
    );

    expect(actual.contains(expected)).toBe(true);
  });
});
