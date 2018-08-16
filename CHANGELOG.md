# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

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
