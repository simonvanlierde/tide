# Product

## Platform

web

## Users

Tide is for anyone who wants simple period tracking. It gets a few seconds at a time:
log today, check when the next period is expected, and look back through the calendar.
People moving from another tracker can bring their bleeding history from Flo or Clue.

Second: people who read Dutch, German, French or Spanish. The app ships in all five
languages.

## Product Purpose

**Mission:** Make period tracking quick, clear and private.

**Vision:** Tide becomes a trusted everyday companion: easy to log, useful for planning,
and honest about what it cannot predict.

Fast period logging and a clear next-period estimate come first. Symptoms, mood and a short
note are optional daily records. Fertility estimates are secondary and appear only when
requested. Everything is stored and worked out on the device.

Success means a small group of people choose Tide for everyday tracking and trust it enough
to keep using it.

## Positioning

No account or backend holds your history. Tide does not upload what you log.
The docs and the app explain the prediction model in plain language, so you can check the
sums yourself instead of trusting a black box. A plain JSON file is the way in and the way
out: import it to bring your history, export it to leave.

## Operating Context

- It installs to the home screen as a progressive web app (PWA) on iOS Safari, Android
  Chrome and desktop Chromium, and works offline.
- There are three screens behind a bottom tab bar: Today, Calendar, Settings.
- Today asks you to log when a period is expected or overdue and the day isn't logged yet.
- State lives in `localStorage` under `tide.period-tracker.state`. The theme is picked
  before the first paint, so the app never flashes the wrong one.
- A skippable introduction covers on-device storage, import, optional fertility estimates,
  home-screen installation and backups. Calendar has a hint until the first bleeding log there.
- Today offers a local backup reminder, and Cycle insights has a history chart and table.
  Incomplete cycles keep their logged days but do not influence cycle-length estimates.
- Optional daily details record symptoms, mood and a note, independently of bleeding.
  They are included in Tide backups and do not affect predictions.
- It runs at <https://tide.duinlab.nl> (Cloudflare; see `wrangler.jsonc`).

## Capabilities and Constraints

- The cycle model is in `src/domain/cycle.ts`, and
  [docs/predictions.md](docs/predictions.md) explains it. Those two are the source of truth, so don't repeat their numbers here.
- Every estimate is an estimate. Fertility estimates stay hidden until you choose to see them
  in the introduction or Settings. The note
  that they are not birth control sits next to the fertility line, not only in Settings.
- Five locales as Lingui PO catalogs, with ICU plurals and dates through `Intl`. German and
  French run long and still have to fit.
- Light and dark themes, following the system or a manual choice.
- CI checks bundle size, coverage, and accessibility with axe in the end-to-end tests.
- Words we use: "bleeding" or "period" for what you log, "cycle day", "phase" (menstrual,
  follicular, ovulation, luteal; "between periods" while fertility estimates are off),
  "fertile window", and "expected" for a predicted day.

## Brand Commitments

Only the name is fixed. The lowercase `tide` wordmark and the teal-and-coral palette are
what we have today, not promises. There are no logo files beyond `public/icons/icon.svg`.
The voice is plain and calm, not clinical.

## Evidence on Hand

Screenshots are in `docs/screenshots/`. The repository is public at
<https://github.com/simonvanlierde/tide> (MIT). There are no testimonials, user research or
usage data. Don't make any up.

## Product Principles

1. Privacy should be visible, not only true: easy to see without nagging.
2. Logging is the whole job. Every other screen is there for the quick look.
3. Estimates look like estimates, never like logged facts.
4. Honest maths beats confident maths: when it matters, show how a number came about.
5. Every locale and every theme gets the same care.

## Accessibility & Inclusion

WCAG AA contrast is the minimum, and axe checks every screen in the end-to-end tests. The
app respects reduced motion everywhere. Users are "people who menstruate", and we never
assume they are women.
