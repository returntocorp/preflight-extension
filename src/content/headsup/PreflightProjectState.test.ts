import { flowProjectState } from "@r2c/extension/content/headsup";
import {
  PreflightChecklistErrors,
  PreflightChecklistLoading
} from "@r2c/extension/content/headsup/PreflightFetch";
import {
  ERROR_UNKNOWN,
  LOADING_ALL,
  LOADING_SOME
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
});
