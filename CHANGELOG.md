# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- A backtest of the next-period estimate on a public cycle dataset, with the
  results and their limits in [docs/backtest.md](docs/backtest.md). Run it with
  `pnpm backtest`.
- Once a day is logged, Tide asks the browser to keep its stored data rather
  than clear it to free space. Firefox shows its own prompt for this.
- The crash screen can download your stored data as a file, exactly as saved,
  and speaks your language instead of always English.

### Fixed

- An app left open overnight now moves to the new day, so logging today no
  longer logs yesterday.
- Importing a JSON file that is not a Tide backup now shows an error instead of
  replacing your history with an empty one.
- Tide starts normally when the browser blocks site storage, instead of showing
  the error screen.
- Future-dated days left by an import or a clock change no longer count in the
  cycle insights or the calendar's past fertile windows.
- Backup files are named after your local date, not the UTC date.
- Screen readers no longer read the info button's label as part of the
  fertility and cycle-number switch names.
- Screen readers now hear which weekday each calendar day falls on: the month
  is a table with a header per weekday column.
- The install icon is listed separately for plain and masked use, so Android
  launchers that apply a mask shape use it as intended.
- On a 320 px screen, the flow levels no longer run into each other, the theme
  options stack instead of shrinking to "Sy…", and Export and Import stack
  instead of splitting their words. German, French, Dutch and Spanish all fit.
- Logging today moves keyboard focus to the flow levels, and removing the log
  or dismissing the reminder moves it to the log button, instead of dropping
  it to the top of the page.
- A tab still running an older version no longer strips data that a newer
  version saved. It shows that data, asks you to reload, and saves nothing
  until you do.
- Tide keeps a copy of the stored data whenever loading it would drop
  anything, not only when the data is unreadable.

### Security

- The Content-Security-Policy no longer allows inline styles.
- Browsers are told to reach tide.duinlab.nl over HTTPS only, for a year at a
  time (Strict-Transport-Security).

## [0.4.0] - 2026-08-24

### Added

- Settings now has a "Delete all data" action, and both deleting and importing
  ask for confirmation first, naming how many logged days are at stake.
- Import and export now report what happened: a saved-backup confirmation, an
  imported-day count, and a readable error for an unusable file.
- Logging a day from the calendar can be undone straight from the confirmation.
- A crash now shows a recovery screen instead of a blank page.
- The build writes Content-Security-Policy and related security headers,
  hashing the inline theme script into the policy.

### Changed

- A one-tap log no longer assumes a flow level. It records that you bled, not
  how much; picking an intensity stays optional.
- Redesigned the Today screen around what matters first: a clear first-run
  state, a calm logged state, and explicit late-period wording.
- The calendar legend is now a caption, and the calendar shows a single series
  of day numbers.
- The type ramp, radii, and shadows are now tokens, so the screens share one
  scale.
- Layouts hold up in narrow shells, in the longer locales, and at 200% text.
- The language setting reads "Device language" instead of "System".

### Fixed

- An impossible date in a backup ("2023-02-29") is now rejected on import
  instead of rolling over into a day that never matches its own entry.
- Kept the theme label visible, and moved the privacy promise into the Data
  card where the data actually lives.

### Documented

- Added DESIGN.md and PRODUCT.md, and corrected the README's features and
  roadmap.

### Tested

- Added coverage for the confirmation dialogs, one-tap logging without a flow
  level, date validation, and the redesigned Today and calendar screens.

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

[Unreleased]: https://github.com/simonvanlierde/tide/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/simonvanlierde/tide/releases/tag/v0.4.0
[0.3.0]: https://github.com/simonvanlierde/tide/releases/tag/v0.3.0
[0.2.1]: https://github.com/simonvanlierde/tide/releases/tag/v0.2.1
[0.2.0]: https://github.com/simonvanlierde/tide/releases/tag/v0.2.0
[0.1.0]: https://github.com/simonvanlierde/tide/releases/tag/v0.1.0
