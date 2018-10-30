import { flowProjectState } from "@r2c/extension/content/headsup";
import {
  PreflightChecklistErrors,
  PreflightChecklistFetchData,
  PreflightChecklistFetchDataResponse,
  PreflightChecklistLoading
} from "@r2c/extension/content/headsup/PreflightFetch";
import {
  COMPLETE,
  ERROR_API,
  ERROR_MISSING_DATA,
  ERROR_UNKNOWN,
  LOADING_ALL,
  LOADING_SOME,
  PARTIAL
} from "@r2c/extension/content/headsup/PreflightProjectState";

describe("Project state", () => {
  const notLoading: PreflightChecklistLoading = {
    every: false,
    some: false,
    findings: false,
    pkg: false,
    repo: false,
    scripts: false
  };
  const blank = {
    loading: notLoading,
    error: undefined,
    data: undefined,
    response: undefined
  };

  it("shows when everything is loading", () => {
    const loading: PreflightChecklistLoading = {
      every: true,
      some: true,
      findings: true,
      pkg: true,
      repo: true,
      scripts: true
    };
    expect(flowProjectState({ ...blank, loading })).toBe(LOADING_ALL);
  });

  it("shows partial loading when some stuff is loading", () => {
    const loading: PreflightChecklistLoading = {
      every: false,
      some: true,
      findings: true,
      pkg: true,
      repo: true,
      scripts: true
    };
    expect(flowProjectState({ ...blank, loading })).toBe(LOADING_SOME);
  });

  it("shows partial loading even if errors show up", () => {
    const loading: PreflightChecklistLoading = {
      every: false,
      some: true,
      findings: true,
      pkg: true,
      repo: true,
      scripts: true
    };
    const error: PreflightChecklistErrors = {
      every: false,
      some: true,
      findings: undefined,
      pkg: undefined,
      repo: undefined,
      scripts: new Error("some error")
    };
    expect(flowProjectState({ ...blank, loading, error })).toBe(LOADING_SOME);
  });

  it("shows unknown error when some responses have errored out and there's no data", () => {
    const error: PreflightChecklistErrors = {
      every: false,
      some: true,
      findings: undefined,
      pkg: undefined,
      repo: undefined,
      scripts: new Error("some error")
    };
    expect(flowProjectState({ ...blank, error })).toBe(ERROR_UNKNOWN);
  });

  it("shows partial data when there's data and some responses have errored out", () => {
    const error: PreflightChecklistErrors = {
      every: false,
      some: true,
      findings: undefined,
      pkg: undefined,
      repo: undefined,
      scripts: new Error("some error")
    };
    const data: PreflightChecklistFetchData = {
      some: true,
      every: false,
      findings: undefined,
      pkg: undefined,
      repo: undefined,
      scripts: { gitUrl: "foo", scripts: [] }
    };
    expect(flowProjectState({ ...blank, data, error })).toBe(PARTIAL);
  });

  it("shows complete data when there's all data, but some responses have errored out", () => {
    const error: PreflightChecklistErrors = {
      every: false,
      some: true,
      findings: undefined,
      pkg: undefined,
      repo: undefined,
      scripts: new Error("some error")
    };
    const data: PreflightChecklistFetchData = {
      some: true,
      every: true,
      findings: { gitUrl: "foo", findings: [], commitHash: "bar" },
      pkg: { gitUrl: "foo", packages: [] },
      repo: {
        gitUrl: "foo",
        commitHash: "bar",
        activity: {
          archived: false,
          isActive: false,
          latestCommitDate: "date"
        },
        analyzedAt: "analyzed"
      },
      scripts: { gitUrl: "foo", scripts: [] }
    };
    expect(flowProjectState({ ...blank, data, error })).toBe(COMPLETE);
  });

  it("shows missing data if all responses are 404 and all errors are triggered", () => {
    const error: PreflightChecklistErrors = {
      every: true,
      some: true,
      findings: new Error("some error"),
      pkg: new Error("some error"),
      repo: new Error("some error"),
      scripts: new Error("some error")
    };

    const response: PreflightChecklistFetchDataResponse = {
      findings: new Response(null, { status: 404 }),
      pkg: new Response(null, { status: 404 }),
      repo: new Response(null, { status: 404 }),
      scripts: new Response(null, { status: 404 })
    };

    expect(flowProjectState({ ...blank, response, error })).toBe(
      ERROR_MISSING_DATA
    );
  });

  it("shows API issues if not responses are 404 and all errors are triggered", () => {
    const error: PreflightChecklistErrors = {
      every: true,
      some: true,
      findings: new Error("some error"),
      pkg: new Error("some error"),
      repo: new Error("some error"),
      scripts: new Error("some error")
    };

    const response: PreflightChecklistFetchDataResponse = {
      findings: new Response(null, { status: 404 }),
      pkg: new Response(null, { status: 404 }),
      repo: new Response(null, { status: 404 }),
      scripts: new Response(null, { status: 500 })
    };

    expect(flowProjectState({ ...blank, response, error })).toBe(ERROR_API);
  });

  it("shows API issues if not responses are 404 and all errors are triggered", () => {
    const error: PreflightChecklistErrors = {
      every: true,
      some: true,
      findings: new Error("some error"),
      pkg: new Error("some error"),
      repo: new Error("some error"),
      scripts: new Error("some error")
    };

    expect(flowProjectState({ ...blank, error })).toBe(ERROR_UNKNOWN);
  });
});
