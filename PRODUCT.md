# Product

## Platform

web

## Users

People who menstruate and are leaving a mainstream period tracker (Flo, Clue and similar)
over data privacy. They arrive with history they want to keep, and they distrust anything
that looks like it phones home. Tide lives on the home screen and gets seconds at a time:
log today, glance at the cycle day, look back through the calendar now and then.

Secondary: readers of Dutch, German, French and Spanish. The app ships all five languages.

## Product Purpose

A privacy-first, local-first period tracker. You log the days you bleed, and optionally how
heavily. It returns the current cycle day and phase, the next expected period, an ovulation
estimate and a fertile window. It works out every number on the device.

Success: the user trusts that nothing leaves the device, logs consistently because it costs
nothing, and finds the forecast good enough to plan around.

## Positioning

No account, no network, no analytics, nothing in the bundle that could exfiltrate data.
The prediction model is written out in plain language in the README and in the app, so a
user can check the arithmetic instead of trusting a black box. A plain JSON file is both
doors: import to bring history in, export to leave.

## Operating Context

- Installs to the home screen as a progressive web app (PWA) on iOS Safari, Android Chrome
  and desktop Chromium. Works offline.
- Three screens behind a bottom tab bar: Today, Calendar, Settings.
- Today prompts when a period is expected or overdue and the day is not yet logged.
- State lives in `localStorage` under `tide.period-tracker.state`. The theme resolves
  before first paint, so the app never flashes the wrong one.
- Deployed at <https://tide.duinlab.nl> (Cloudflare; see `wrangler.jsonc`).

## Capabilities and Constraints

- The cycle model lives in `src/domain/cycle.ts` and is explained in the README under "How
  predictions work". Treat that pair as the source of truth; do not restate its numbers.
- Every estimate is an estimate. Fertility sits behind a settings toggle, and the
  disclaimer that it is informational and not birth control stays in the product.
- Five locales as typed dictionaries, dates and plurals through `Intl`. German and French
  run long and have to fit.
- Light and dark themes, following the system or an override.
- CI enforces bundle size, axe accessibility in the end-to-end tests, and coverage.
- Terminology: "bleeding" or "period" for the logged event, "cycle day", "phase"
  (menstrual, follicular, ovulation, luteal), "fertile window", "expected" for a
  predicted day.

## Brand Commitments

Only the name is fixed. The lowercase `tide` wordmark and the teal-and-coral palette are
what exists today, not commitments. No logo files beyond `public/icons/icon.svg`. The
voice is plain, calm and non-clinical.

## Evidence on Hand

Screenshots in `docs/screenshots/`. Public repository at
<https://github.com/simonvanlierde/tide> (MIT). No testimonials, user research or usage
data exist. Do not invent any.

## Product Principles

1. Privacy is visible, not just true: legible without nagging.
2. Logging is the whole job; every other screen serves the glance.
3. Estimates look like estimates, never like logged facts.
4. Honest math beats confident math: show how a number was reached when it matters.
5. No locale and no theme is second-class.

## Accessibility & Inclusion

WCAG AA contrast is the floor, and axe runs against every screen in the end-to-end tests.
Reduced motion is honoured globally. Users are "people who menstruate", never assumed to
be women.
