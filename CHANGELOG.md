# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

## [1.12.0] - 2018-10-30

### Added

- We show the "Current Commit" badge when viewing the master branch if we've analyzed the latest commit (previously you had to be looking at the specific commit, not master) (#147)
- You can now discover packages frequently used alongside the package you're currently viewing
- Added a star next to packages in the package chooser that are used by prominent orgs

### Changed

- Updated the language we use for unsupported projects to more clearly explain our npm focus (thanks @deifactor for the feedback!)
- Made package handling more consistent across Preflight. Instead of showing information for all packages associated with the project you're looking at, we now show information for the currently selected package in the "Install" box, the "Used by" section, and the "Used with" section
- We now fail more gracefully depending on the information we have about a project

### Fixed

- Fixed an issue where we incorrectly reported no package.json install scripts for some projects
- Fixed us always displaying `[object Object]` in error message details (#134)

### Removed

- We no longer surface non-literal regular expression findings because we've found regex DDOS findings to be low signal

## [1.11.0] - 2018-10-16

### Changed

- When you click on the issues badge next to a file or folder, you can now go directly to the individual files and issues by clicking on them. (#102)
- We've hidden the Permissions checklist item behind an experiment for now while we're working on finding new permissions and improving how we detect permissions. We'll bring it back when we've had some time to validate our new permission behavior.
- The Preflight checklist now has a header instead of a footer.
- We've moved information about how recently Preflight data was updated to the top of the checklist and details pane.

### Fixed

- Fixed alignment of "let us know" button for possibly unsupported repos (#136) (thanks @JoshuaKGoldberg for the issue!)

## [1.10.1] - 2018-10-02

### Fixed

- Fixed the email button in the Feedback tab not navigating properly
- Fixed a missing uninstall hook in Chrome since it doesn't support `window.browser` (#64)

## [1.10.0] - 2018-10-01

### Added

- Added `esc` as hotkey to close Preflight side panel when it's open
- Added a way to provide feedback and chat with us via Intercom. Click on the extension icon in the browser toolbar and click "Feedback".
- You can now explore locations in the project where we found permissions

### Changed

- We no longer show the Preflight sidebar on npmjs.com. We'll bring it back when we have more things to say about npm packages themselves
- Added instrumentation to inform us when people visit public repositories we don't have Preflight data for
- Improved formatting and readability of npm install hooks
- Renamed "Firehose" to "Activity Feed" to more clearly describe what it is (#80, #81)
- Updated the Preflight manifest, conversation, and share icons
- Permissions now displays the number of network calls found, pending us adding more permissions to our dataset (#87)
- Removed the word "All" from "All packages used by" (thanks @ievans for the feedback!)
- Modified "activity" to instead display "data freshness"

### Fixed

- Fixed not showing the uninstall page properly (#64)
- Fixed missing packages causing an error when showing used by (symptom of #50)
- Fixed issues with error styling (#50)
- Fixed incorrect display of checkmark when activity data couldn't be loaded (#89)
- Fixed where we were showing an error message and a loading box at the same time (#68)
- Fixed where "Choose a package" search field wasn't actually hooked up 🤔 (#76)
- Fixed accidentally showing the "Issues on other commit" warning banner even if there weren't any issues in the current file (#105)
- Fixed the package select box moving about on small screens (#73)
- Fixed parsing of GitHub URLs so a trailing slash doesn't break things

### Removed

- Removed Top 10 tab from popup because voting on projects was removed in earlier versions
- Removed "flag" button as it was confusing to multiple users. We're going to reintroduce a better reporting workflow in its place

## [1.9.2] - 2018-09-21

### Changed

- We updated the branding of the extension in the Mozilla and Chrome store to be "Preflight Beta"

### Fixed

- Fixed [#58](https://github.com/returntocorp/secarta-extension/issues/58): Incorrect vulnerability count on checklist

## [1.9.1] - 2018-09-20

### Changed

- Enable Recon and Preflight manifest experiments by default

### Fixed

- Fixed an issue with floating action bar buttons (thanks @mtuer for reporting!)

## [1.9.0] - 2018-09-20

### Added

- Code issues we discover are now displayed as a checklist item
- The Preflight manifest now shows findings, permissions, and vulnerabilities
- When Recon mode is enabled, we now show a message if we've found historical code issues on a source file you're looking at
- When the Preflight manifest is enabled, you can now click on a checklist item to jump to that section of the manifest

### Fixed

- Improved reliability of showing Preflight checklist and experimental Recon issue markers on the page
- Fixed some performance issues with the sidebar
- Fixed an issue where we'd display permissions in the manifest even if they weren't found in the project
- Fixed some overly verbose error messages

## [1.8.3] - 2018-09-18

### Fixed

- Fixed regression where endorsers no longer show up for a package

## [1.8.2] - 2018-09-17

### Changed

- We've reworked the layout and design of the package manager component (now with more GitHub pizzaz)

### Fixed

- The package manager component now displays the most popular package for the project by default, rather than the alphabetically first package

## [1.8.1] - 2018-09-14

### Changed

- We've enabled the Preflight experiment by default

### Fixed

- Fixed incorrect version in the extension settings tab
- Fixed comment box overflowing containing twist

## [1.8.0] - 2018-09-14

### Added

- New experiment: Preflight checklist
  - When looking at a supported repository, we'll show:
    - a list of criteria that you might be interested in when evaluating the project for security and quality
    - an easy way to install the most used package for the repo you're looking at
  - Please let us know if you find these criteria useful, or if you have suggestions and feedback on how to make them better.
- New experiment: Preflight manifest
  - On a supported repository, we'll start to surface details about Preflight criteria in the sidebar.
  - This experiment is even earlier than usual, so expect it to evolve substantially over the coming days.
  - As always, let us know if there's additional info or a particular way to see this info that you'd be interested in.

### Changed

- After chatting with people, we're trying out a "Flag this project for review" in lieu of upvote/downvote buttons.

### Fixed

- Lots of behind the scenes engineering changes and improvements.

### Known issues

- Comment counts no longer appear due to a change in how we render buttons. We're looking into ways to remedy this.

## [1.7.1] - 2018-09-10

### Changed

- Filter our recon findings to substantially reduce noisy issues shown to users.

## [1.7.0] - 2018-09-10

### Added

- New experiment: Recon mode
  - When looking at code with known issues, we'll highlight files and line numbers where these issues occur
- Added an experiment panel in the extension: click the R2C extension icon in the top right corner and then the icon in the tab bar

### Fixed

- Changed icon to be visible on dark-themed browser toolbars
- Made recon mode GitHub integration more robust - now it should work more consistently with all browsers and on flakier networks.

## [1.6.0] - 2018-09-04

### Added

- Added sharing functionality with the following options.
  - copy to clipboard
  - click to start an email
  - added logging for social interactions

## [1.5.1] - 2018-08-28

### Fixed

- Fixed an issue where custom GitHub styling could cause icons to be difficult to see (thanks @jamesross3!)

## [1.5.0] - 2018-08-28

### Added

- Added repository information to the extension, including:
  - A work-in-progress score that sums up the properties of the project. Higher scores imply a higher quality project.
  - Permissions or capabilities that we've detected in the project. You can use this list to understand what the project does, and whether or not the project has permissions or capabilities that you expect it to have.
  - If the project is published to NPM, we show the most-used published package and the command to easily install the package.
- Added a comment count next to the comment bubbles
- Instrumented various extension interactions with remote analytics so we can better understand how people use the extension and develop our future product experiments. We did not instrument any part of the native GitHub user interface and do not collect any sensitive information. See [our stance on privacy](./PRIVACY.md) for more info.

### Changed

- Changed the comment bubbles from single bubble to double bubble for aesthetics

## [1.4.0] - 2018-08-22

### Added

- You can now see what other people are voting and commenting on via the Guide by clicking on the extension's icon in your browser's nav bar. The Guide currently features:
  - Firehose: an unfiltered stream showing how others are voting and commenting
  - Top 10: a list of top and controversial projects throughout GitHub
  - Inbox: a list of comments that mention your GitHub username
- You can now share your opinions on a repository by adding a comment
- You can now cancel your vote by clicking on the selected vote button again
- Show profile pictures next to voter counts

### Fixed

- Remove dependency on blueprint icons to avoid errors
- Fixed anonymous voters appearing in list
- Workaround for `crypto.getRandomValues` not working in WebExtension host on Microsoft Edge

## [1.3.1] - 2018-08-16

### Fixed

- Ensure we don't log or make network requests on private projects

## [1.3.0] - 2018-08-16

### Fixed

- Removed global style that accidentally changed the fonts used on GitHub. Sorry
- Port remaining JS DOM manipulation to more understandable React stuff

### Changed

- Change voting to up/down iconography
- Change orientation of buttons to be vertical
- Move voting buttons to top-right of screen, rather than bottom-right

## [1.2.6] - 2018-08-16

### Changed

- Ported extension framework to TypeScript and React.

## [1.2.5] - 2018-08-15

### Removed

- Removed unnecessary permission for app.secarta.io

## [1.2.4] - 2018-08-15

### Changed

- Updated extension branding and icon to consistent with R2C / ret2.co

## [1.2.3] - 2018-08-15

### Fixed

- Anonymous ids are now shorter and prefixed with `anonymous-` for ease of viewing

## [1.2.2] - 2018-08-15

### Added

- Unique installation ID to allow anonymous voting. You can regenerate this ID by clearing extension storage.

## [1.2.1] - 2018-08-15

### Added

- We now show vote counts above the voting buttons. This count updates when you vote.

### Changed

- Updated colors to be less glaring

## [1.2.0] - 2018-08-15

### Added

- You can now vote on GitHub repositories and NPM packages. More coming soon.

### Removed

- Ability to see score in a Secarta badge. This will come back in a near future release.

## [1.1.13] - 2018-06-29

### Fixed

- Fix issue getting package name on npmjs.com

### Added

- No longer require users to be logged in to Secarta to view scores for public projects

## [1.1.12] - 2018-06-25

### Removed

- No longer show popup when extension icon is clicked.

## [1.1.11] - 2018-06-25

### Added

- Preliminary npmjs.com support
- Add license files

## [1.1.10] - 2018-06-20

### Added

- New icon and hover over state if an analysis hasn't been performed yet

### Fixed

- We no longer cache the Secarta score for 1 day, which caused issues if a faulty score was returned
- Apply consistent lock icon styling, where previously certain error states led to CSS classes being misapplied

## [1.1.9] - 2018-06-08

### Changed

- Lock icon now links to project page, not just secarta.io (for better user experience and engagement)

## [1.1.8] - 2018-06-08

### Fixed

- Updated returntocorp.com to secarta.io

## [1.1.7] - 2018-05-31

### Fixed

- Updated badge button to link to new report URLs

## [1.1.6] - 2018-05-24

### Changed

- Updated badge language
- Add "pts" to the output

## [1.1.5] - 2018-05-24

### Fixed

- Display Secarta badge on all repository tabs

## [1.1.2] - 2018-05-22

### Added

- Use local cache with 1-day expiry
- Fade in the badge
- Access token is now displayed more often in the extension popup for debugging purposes

### Changed

- Copy
- Slight styling tweaks

### Fixed

- Links now open in new tab with referrer protection
- Promisify more things
- Accident where I replaced the shield icon instead of the notice icon with the padlock

## [1.1.1] - 2018-05-21

### Added

- Basic color buckets (red, yellow, green) for projects < 40, 40 < score <= 75, and > 75 respectively.
- Shield icon (actual logo TBD)
- Lock icon when you're not logged in
- This changelog

## [1.1.0] - 2018-05-21

### Changed

- Badge now renders in-browser using `/score` endpoint

### Fixed

- Extension popup now shows the score breakdown for the current tab, if available (Chrome, Firefox)
- Fixed various edge cases with displaying score and current repo
