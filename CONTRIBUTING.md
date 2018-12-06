# Contributing

## Getting started

First, run:

```
yarn
```

to install dependencies.

For development:

- Run `yarn start` to start the dev server
- Run `yarn build` to produce a production build
- Run `yarn storybook` to start a [Storybook](https://github.com/storybooks/storybook/) instance (port 6006 by default)
  - Look in the `stories/` directory for the story description files

You should be able to use `yarn start` for the vast majority of development for both scripts injected into the page and the popup.

For both dev server and a built extension, you can load the extension out of the `build/` folder. In Firefox, point to the `manifest.json` in the build folder; in Chrome and Edge, point to the build folder itself. After rebuilding or hot-reloading, you might have to reload the page or reload the extension (click the reload button, not necessarily remove and reinstall).

## Local testing

Make sure to login to Chrome browser with a non-r2c login. Then, load the extension by finding the `build` directory from step 2 above.

## Publishing

- Make sure `CHANGELOG.md` is up to date with your changes. Add `added`, `changed`, `fixed` headings as necessary.
- Add a heading between `## Unreleased` and the latest changes with the new version and current date (e.g. `## [1.5.0] - 2018-09-18`). Follow semver.
- Commit your changes and merge to `master`.
- [Create a new release](https://github.com/returntocorp/preflight-extension/releases/new) off of `master` with the same version verbatim (e.g. `1.5.0` with no `v`). Title the release `VERSION - DESCRIPTION` (e.g. `1.5.0 - Electric boogaloo`) and copy-paste the whole version section from the changelog, including all headers.

### Chrome Extension Store

CI will automatically publish tagged releases to the Chrome extension store with no further intervention required.

### Mozilla Add-ons Repository

Publishing to the Mozilla Add-ons repository is a manual process right now.

- Log into the Mozilla Add-ons repository with credentials from the password vault
- Top right > R2C > Manage My Submissions
- R2C Beta > New Version
- Checkout the tag that you created earlier (e.g. `git checkout 1.5.0`)
- Run `yarn` to install dependencies.
- Run `yarn build` in this repository to build a production-ready version of the extension
- Run:

  ```sh
  jq '.name = "Preflight Beta"' build/manifest.json | sponge build/manifest.json
  jq '.browser_action.default_title = "Preflight"' build/manifest.json | sponge build/manifest.json
  jq --arg VERSION "$(git describe --tags)" '.version = $VERSION' build/manifest.json | sponge build/manifest.json
  ```

  in the repository directory to amend the version to the tag (e.g. `1.5.0`)

- Zip up the extension directory: `mkdir -p dist && cd build && zip -r ../dist/extension.zip *`
- Upload the zip file at `dist/extension.zip` to the Add-on Developer Hub using the `Select a file...` button on the Submit a New Version page.
- You may get a warning message saying that the validation process found issues with `eval` or the like. We'll address that on the next step. Click `Continue`.
- We need to submit source code for this project. Check the `Yes` button.
- You should upload a freshly cloned version of the source code checked out to your tag. The easiest way to do this is probably to clone to a fresh repo and do a checkout.

  ```sh
  git clone https://github.com/returntocorp/preflight-extension preflight-1.5.0
  cd preflight-1.5.0
  git checkout 1.5.0
  zip -r ../preflight-src-1.5.0.zip *
  cd ..
  rm -r preflight-1.5.0
  ```

- Click `Browse...` and choose the `preflight-src-version.zip` file you just created.
- Copy the release notes from the change log verbatim into the `Release notes` box.
- Write the following note to the reviewer:

  ```md
  Source code is available at:

  https://github.com/returntocorp/preflight-extension

  See the `CONTRIBUTING.md` file for details on how to build and run the extension.
  ```

- Press `Submit Version`
- You're done!
