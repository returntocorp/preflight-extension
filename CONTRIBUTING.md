# Contributing

## Getting started

1. `yarn`
1. `yarn start` to start the dev server.
1. `yarn build` to build the extension fully. Due to Content-Security-Policy, you **must** run `yarn build` when working on the extension popup; otherwise, the popup will be blank.

For both dev server and a built extension, you can load the extension out of the `build/` folder. In Firefox, point to the `manifest.json` in the build folder; in Chrome and Edge, point to the build folder itself. After rebuilding or hot-reloading, you might have to reload the page or reload the extension.

## Local testing
Make sure to login to Chrome browser with a non-r2c login. Then, load the extension by finding the `build` directory from step 2 above.

## Publish to Chrome Web Store

To publish to the Chrome Web Store, tag a new release off of `master`. Releases must be chronologically increasing and follow the [semver](https://semver.org/) format.
