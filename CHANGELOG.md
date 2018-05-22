# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.2] - 2018-05-22

### Added

* Use local cache with 1-day expiry
* Fade in the badge
* Access token is now displayed more often in the extension popup for debugging purposes

### Fixed

* Links now open in new tab with referrer protection
* Promisify more things
* Accident where I replaced the shield icon instead of the notice icon with the padlock

## [1.1.1] - 2018-05-21

### Added

* Basic color buckets (red, yellow, green) for projects < 40, 40 < score <= 75, and > 75 respectively.
* Shield icon (actual logo TBD)
* Lock icon when you're not logged in
* This changelog

## [1.1.0] - 2018-05-21

### Changed

* Badge now renders in-browser using `/score` endpoint

### Fixed

* Extension popup now shows the score breakdown for the current tab, if available (Chrome, Firefox)
* Fixed various edge cases with displaying score and current repo
