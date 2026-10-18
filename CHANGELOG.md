# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Import your history from Clue or Flo: pick the export in Settings → Data →
  Import, the same button as for a Tide backup. Tide shows how many days the
  file holds and asks before adding them. Days you already logged in Tide stay
  as they are. From Clue, use `measurements.json` from the export zip or an
  older `.cluedata` backup. Days where Clue recorded a period of "none" are
  skipped, not imported as period days.
- Log a past period in one go from the Calendar: pick its first and last day,
  up to 14 days, and every day between is logged. Set each day's flow after,
  or undo the whole range with one tap.
- Before anything is logged, Today asks "Have a Tide backup, or history in Clue
  or Flo?" Its "Import it" link opens Settings at the Import button.
- Settings → Data says under the buttons that Import takes a Tide backup or an
  export from Clue or Flo, so you don't have to open the info button to find out.
- The fertility question on Today says you can change your answer in Settings.
- A backtest of the next-period estimate on a public cycle dataset, with the
  results and their limits in [docs/backtest.md](docs/backtest.md). Run it with
  `pnpm backtest`.
- Once a day is logged, Tide asks the browser to keep its stored data rather
  than clear it to free space. Firefox shows its own prompt for this.
- The crash screen can download your stored data as a file, exactly as saved,
  and speaks your language instead of always English.

### Changed

- Tide asks once whether to show fertility estimates, and hides them until you
  answer. This includes current users, who had them on without being asked.
  If you had turned them off in Settings, that choice stays. The Settings
  switch still changes the answer.
- Every estimate looks like an estimate: the expected period, the fertile
  window and ovulation are dashed outlines on both the dial and the calendar,
  and in both legends. Only logged days are filled. The outline is the only
  cue: an expected period day no longer also turns its number coral, so it
  looks no more certain than a fertile day.
- The Today fertility line says "In the fertile window (estimate)" or "Outside
  the fertile window (estimate)", with "Not birth control" right under it. It
  names the same fertile window as the legends, and no longer says a day is
  "less likely", which could read as a safe day.
- The calendar legend uses the same words as the Today legend: Period,
  Expected period, Fertile window, Ovulation.
- One word for every forecast in all five languages: "expected" (the expected
  period, expected ovulation), where some screens said "predicted" or "likely".
  Settings explains the fertile window in those words and says the estimates
  are for information only and not birth control.
- German and Spanish use one word for a Tide backup everywhere.
- Before the first log, Today shows one line, "Log your period to see a
  forecast", instead of a "--" cycle day and two "Not enough data yet" rows.

### Fixed

- On narrow phones (320px wide), the four flow levels sit two by two, so
  "Schmierblutung" and a bold "Medium" fit whole instead of breaking mid-word.
  The calendar's day picker does the same on most phones.
- Cycle insights fit on narrow phones: the three numbers no longer push past
  the sheet, and the regularity line wraps under its label.
- The language menu in Settings no longer runs past the card on very narrow
  screens.
- Until you turn on fertility estimates, the cycle dial no longer names an
  ovulation, follicular or luteal phase, on screen or to a screen reader. It
  shows the period and "Between periods", and Cycle insights leaves out how
  ovulation is estimated.
- The theme picker in Settings no longer cuts "Système" or "Systeem" short on
  phones about 390px wide when the system font runs wide, as DejaVu Sans does
  on many Linux setups.
- When a newer version of Tide saved your data, Settings showed the notice
  twice. It now shows once, at the top, with the Reload button.
- Screen readers now announce that notice when another tab saves newer data.
  Before, it appeared already filled in, so many screen readers stayed silent.
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
  until you do. Import and "Delete all data" are disabled meanwhile.
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
[0.4.0]: https://github.com/simonvanlierde/tide/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/simonvanlierde/tide/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/simonvanlierde/tide/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/simonvanlierde/tide/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/simonvanlierde/tide/releases/tag/v0.1.0
