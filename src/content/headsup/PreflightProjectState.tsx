export type PreflightProjectState =
  | "complete"
  | "partial"
  | "loading-all"
  | "loading-some"
  | "empty-unsupported"
  | "override"
  | "error-missing-data"
  | "error-api"
  | "error-unknown";

/**
 * Don't export. Internal alias for this file only to save my keyboard quota.
 */
type PPS = PreflightProjectState;

/**
 * We've finished loading all data, and it's all there
 */
export const COMPLETE: PPS = "complete";

/**
 * We've loaded all data, only some data is available for the current commit
 */
export const PARTIAL: PPS = "partial";

/**
 * We're still in the middle of loading everything and no data is finished loading.
 */
export const LOADING_ALL: PPS = "loading-all";

/**
 * We're loading some data, but some of the data is finished and ready.
 */
export const LOADING_SOME: PPS = "loading-some";

/**
 * We don't have data because we don't support this language or project.
 */
export const EMPTY_UNSUPPORTED: PPS = "empty-unsupported";

/**
 * We're showing exceptional state for the repo.
 */
export const OVERRIDE: PPS = "override";

/**
 * We should have data, but for some reason we don't.
 */
export const ERROR_MISSING_DATA: PPS = "error-missing-data";

/**
 * Something's going wrong with the API.
 */
export const ERROR_API: PPS = "error-api";

/**
 * We have no idea what's going on.
 */
export const ERROR_UNKNOWN: PPS = "error-unknown";
