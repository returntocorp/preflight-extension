# Contributing

## Getting started

1. `yarn`
1. `yarn start` to start the dev server.
1. `yarn build` to build the extension fully. Due to Content-Security-Policy, you **must** run `yarn build` when working on the extension popup; otherwise, the popup will be blank.

For both dev server and a built extension, you can load the extension out of the `build/` folder. In Firefox, point to the `manifest.json` in the build folder; in Chrome and Edge, point to the build folder itself. After rebuilding or hot-reloading, you might have to reload the page or reload the extension.

## Local testing

Make sure to login to Chrome browser with a non-r2c login. Then, load the extension by finding the `build` directory from step 2 above.

## Publishing

- Make sure `CHANGELOG.md` is up to date with your changes. Add `added`, `changed`, `fixed` headings as necessary.
- Add a heading between `## Unreleased` and the latest changes with the new version and current date (e.g. `## [1.5.0] - 2018-09-18`). Follow semver.
- Commit your changes and merge to `master`.
- [Create a new release]((https://github.com/returntocorp/secarta-extension/releases/new)) off of `master` with the same version verbatim (i.e. `1.5.0` with no `v`)

### Chrome Extension Store

CI will automatically publish tagged releases to the Chrome extension store with no further intervention required.
