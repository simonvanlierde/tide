# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-07-06

First tagged release. Core cycle tracking is implemented, tested, and live at
[tide.duinlab.nl](https://tide.duinlab.nl).

### Added

- Log bleeding days with per-day intensity, added or removed with one tap.
- Tidal cycle dial on the Today screen showing the current day and phase, key
  cycle dates, and a scrub preview.
- Predictions: next period learned from history (28-day fallback), plus an
  approximate fertile window and ovulation estimate, with a toggle to hide
  fertility estimates.
- Log reminders: a dismissable one-tap prompt in the days around a predicted
  period.
- Calendar screen with per-day period numbers and ovulation / next-period
  markers.
- Installable, offline-capable PWA; all data stays on the device, with no
  accounts, network, or analytics.
- Theme toggle (system / light / dark) with AA contrast in both themes.
- About section in Settings linking to the source and showing the app version.

### Documented

- Architecture decision record for the local-first, no-backend design
  ([docs/adr/0001-local-first-no-backend.md](docs/adr/0001-local-first-no-backend.md)).

[Unreleased]: https://github.com/simonvanlierde/tide/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/simonvanlierde/tide/releases/tag/v0.1.0
