# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-07-06

### Added

- Forecasts now show learned multi-day periods across future cycles, with a
  fertile window that adapts to recent cycle variability.
- The Today screen now includes a cycle insights panel.
- GitHub issue templates, a pull request template, and contributing guidelines
  are now included.

### Changed

- Redesigned the Today cycle dial as an open gauge with a scrubbable predicted
  period preview.
- Calendar period-day numbers are now cycle-day numbers, and the History
  calendar repeats full predicted period spans into future cycles.
- Replaced the native month input with a custom History month and year picker.
- Refreshed the Settings information popovers, section layout, screenshots, and
  app styling.
- Period days are now derived from the daily flow-intensity map.
- Documentation now explains how local cycle predictions are calculated.
- Renamed the internal History feature to Calendar (module, components, CSS classes, and the `/history` route is now `/calendar`) to match the UI label.

### Fixed

- Fixed cycle math and calendar edge cases around ovulation markers, final
  logged periods, overdue cycle-day numbering, and dial scrubbing.

### Tested

- Added and updated coverage for predictions, forecasts, the redesigned dial,
  insights, settings, import migration, and history interactions.

## [0.2.1] - 2026-07-06

### Changed

- Reworked the About footer: version and source link as a pill, plus a
  copyright line.
- Shortened the About notes and slimmed the Data card spacing.
- Dependabot now uses a cooldown before opening update PRs.

## [0.2.0] - 2026-07-06

### Added

- Calendar logging is now one tap for empty days, with a follow-up picker for
  changing flow or removing a logged day.
- Calendar navigation now supports swiping between months, PageUp/PageDown
  keyboard shortcuts, and a Today highlight.
- Settings now include import/export controls for local JSON backups.
- Settings now include a toggle for showing or hiding period day numbers on the
  calendar.
- The README now shows both Today and Calendar screenshots, with light and dark
  variants.

### Changed

- Settings preferences were reorganized into a compact Preferences card with
  switches, a segmented theme control, and inline helper popovers.
- Calendar day labels now distinguish between logging empty days and editing
  logged days.
- Mobile layout and viewport handling were tightened for narrow and short
  screens.
- Dark theme flow colors were retuned so each intensity remains readable.

### Tested

- Added import/export parsing coverage.
- Added calendar interaction coverage for one-tap logging, picker focus,
  outside-click close, swipe navigation, PageUp/PageDown navigation, and hidden
  period day numbers.
- Added Playwright viewport coverage for narrow phones, fold cover widths, and
  short screens.

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

[0.3.0]: https://github.com/simonvanlierde/tide/releases/tag/v0.3.0
[0.2.1]: https://github.com/simonvanlierde/tide/releases/tag/v0.2.1
[0.2.0]: https://github.com/simonvanlierde/tide/releases/tag/v0.2.0
[0.1.0]: https://github.com/simonvanlierde/tide/releases/tag/v0.1.0
