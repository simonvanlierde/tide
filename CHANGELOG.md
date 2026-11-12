# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Settings → Data opens with one line saying how many days are logged and that they stay on
  this device. Export shows when you last downloaded a backup and Import names the apps it
  reads. Backup, calendar export and Delete all data sit in separate groups, with each
  message under the action that caused it.
- Add to calendar lets you pick 3, 6 or 12 expected periods right under the button, and
  fertile windows are a switch beside the calendar legend's own swatch. The confirmation says what the file holds.
- Delete all data and a replacing import now use a raspberry confirm button and offer
  "Download a backup first" inside the dialog. After a delete, Settings says "All data
  deleted."
- Shorter text across the app. The Data info popover is gone. The calendar note, the
  backup reminder, the Calendar first-visit hint and the cycle history description are
  shorter. In Cycle insights, "How was this worked out?" is a closed disclosure that also
  holds the prediction rules your own sums don't show, instead of a second list.
- The import error names the file types it accepts. German: "Allgemein", "Darstellung"
  and "Zum Kalender hinzufügen"; Dutch: "Aan agenda toevoegen".

## [0.5.0] - 2026-11-12

### Added

- Record optional symptoms, mood and a short note for today or a past day,
  independently of bleeding. [Daily details](README.md#daily-details) are included in backups
  and do not affect predictions.
- Today and Calendar share a dated editor for flow and optional daily details.
  Selecting a Calendar day opens it without logging bleeding. Notebook icons mark saved
  details, including diary-only days. Calendar also logs a whole period of up to 14 days at once, with Undo.
- A skippable introduction explains on-device storage, importing history, fertility choices
  and backups. It links to Calendar for periods that started earlier. Existing installations skip it.
- Import bleeding history from Clue or Flo without replacing days already logged in Tide.
  Settings previews the count and asks before adding the days.
- Save the next three expected periods as a calendar file, with optional fertile windows.
  Events are private; the calendar account you add them to can store and sync them.
- [Cycle insights](docs/predictions.md) shows the latest 12 completed cycles in a chart and table.
  Mark incomplete cycles to exclude their lengths from estimates without deleting logged days.
- “How was this worked out?” explains the next-period date, recent variation and fertility estimates.
  [Backtest](docs/backtest.md) and [sparse-history results](docs/sparse-history.md) document the model’s limits.
- Today reminds you to download a backup after 60 days, with a one-week snooze.
  Reminder dates stay on this device and are omitted from backups.
- Privacy and accessibility pages work offline. A [backup guide](docs/backups.md) explains safe restores
  and the JSON format. The site also publishes security-contact details and link previews.
- Today's header shows today's date, so the next-period date has a day to count from.

### Changed

- Today puts the next-period estimate and logging first. Fertility estimates stay hidden
  until you choose to see them; their info popovers explain that they are not birth control.
- Logged days and estimates have distinct colours and outlines on the dial, calendar and legends.
  Fertile days are periwinkle and ovulation is gold. Optional dial motion respects reduced motion.
- Daily details save as you edit. Notes show a character count; optional symptoms and mood
  sit under “More details”. One close control replaces Done and ×; empty footer rows are removed.
  On phones, Today and Calendar use a bottom sheet with a visible date and close control;
  expanded details scroll inside it while the Calendar remains interactive.
  Range-log confirmations expire after ten seconds, pausing on hover or focus.
- All five languages use [Lingui PO catalogs](README.md#translations) bundled for offline switching.
  Wording and narrow-screen layouts are clearer in Dutch, German, French and Spanish.
- Calculating period duration for a twenty-year synthetic history fell from 4.47 to 1.33 ms
  against 0.4.0. [Predictor benchmarks](docs/performance.md) also record the added range-logging cost
  and measurement limits; the next-period prediction rule is unchanged.
- Tide requests persistent browser storage after a bleeding log. The crash screen can download
  the stored data exactly as saved, and reports errors in your chosen language.
- The dial reads in time order: today on top, then the next period. On a day with bleeding
  logged, "Period day 5" is the headline, with how long your periods usually last under it.
- Daily details no longer offer a separate **No symptoms** choice: leaving symptoms blank says
  the same. Backups that hold it still import, as no symptoms logged.

### Fixed

- Today moves to the new date at midnight even if the device clock was corrected that evening.
- Older tabs cannot overwrite state saved by a newer build. Delete and import recheck concurrent
  changes; loading incomplete or unreadable data preserves a recovery copy.
- Blocked or full storage produces a warning with a way to export a backup.
  A failed import-reader download offers a retry instead of leaving the import unanswered.
- Calendar exports reset event identities when historical edits renumber cycles, so an existing
  event cannot move to another cycle. After changing older history, remove old calendar events manually.
- If a recovery backup cannot be saved, Tide preserves the original stored data and offers
  a raw download instead of overwriting it with an incomplete copy.
- An app left open overnight logs the current day. Future-dated logs do not affect estimates,
  history or past fertile windows. Backup filenames use your local date.
- Keyboard focus returns to the affected control after logging, removing and undoing days.
  Screen readers hear weekday names, notices and complete control labels.
- Calendar includes visible cycle-day counts in accessible names. Enlarged navigation labels
  wrap instead of pushing destinations offscreen on narrow phones.
- Switches have sufficient contrast in both themes. Flow levels, theme choices, insights and
  translated labels fit narrow phones and enlarged text without hiding behind the tabs.
- The background stays anchored to the viewport when switching between short and long screens.

### Security

- The Content-Security-Policy blocks inline styles and scripts. Other sites cannot embed Tide’s files,
  and browsers receive HTTPS-only instructions. Tide does not upload logged data.

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

[Unreleased]: https://github.com/simonvanlierde/tide/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/simonvanlierde/tide/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/simonvanlierde/tide/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/simonvanlierde/tide/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/simonvanlierde/tide/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/simonvanlierde/tide/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/simonvanlierde/tide/releases/tag/v0.1.0
