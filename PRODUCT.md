# Product

## Platform

web

## Users

Primary: people who menstruate and are leaving mainstream period-tracking apps (Flo, Clue and
similar) because of data-privacy concerns. They arrive with history they want to keep, are
sceptical of anything that looks like it phones home, and use Tide as an installed PWA on a phone:
a few seconds a day to log bleeding, a glance at Today for "where am I in my cycle", occasional
calendar review.

Secondary (confirmed by i18n): non-English speakers in nl, de, fr, es.

## Product Purpose

A privacy-first, local-first period tracker. Log bleeding days (with optional intensity:
spotting / light / medium / heavy), see the current cycle day and phase, and get a next-period
forecast, an ovulation estimate, and a fertile window computed entirely on-device.

Success: the user trusts that nothing leaves their device, logs consistently because it is
effortless, and finds the forecast reliable enough to plan around.

## Positioning

No account, no network, no analytics, nothing in the bundle that could exfiltrate data. The
full prediction model is documented in plain language in the README and in-app (cycle insights),
so a user can check what the app is doing instead of trusting a black box. Import/export as a
plain JSON file is the migration path in and the exit path out.

## Operating Context

- Installed to the home screen on iOS Safari / Android Chrome / desktop Chromium; works offline.
- Three screens behind a bottom tab bar: Today, Calendar, Settings.
- Reminder prompt on Today when a period is expected or overdue and today is not logged.
- Data lives in `localStorage` under `tide.period-tracker.state`; theme is resolved before first
  paint to avoid a flash.
- Deployed at <https://tide.duinlab.nl> (Cloudflare, see `wrangler.jsonc`).

## Capabilities and Constraints

- Cycle model (README "How predictions work"): 10-day gap starts a new cycle; cycle length is
  the median of the last 6 completed cycles (28-day fallback); period length averaged and
  clamped 2–7 days (4 default); ovulation 14 days before next period; fertile window −5/+1
  days widened by cycle standard deviation (cap ±5).
- Fertility display is optional (settings toggle). The disclaimer ("informational, not a form of
  birth control") stays in the product; its prominence is design's call (soft guidance, not a
  binding placement rule).
- Five locales via typed dictionaries; dates and plurals through `Intl`. German and French strings
  run long and must fit.
- Light and dark themes; user override or system.
- Budgets enforced in CI: bundle size (`scripts/checkBundleBudget.mjs`), axe accessibility in
  Playwright e2e, coverage.
- Terminology: "bleeding" / "period" for the logged event, "cycle day", "phase" (menstrual,
  follicular, ovulation, luteal), "fertile window", "expected" for predicted days.

## Brand Commitments

Only the name, Tide, is fixed. The current lowercase `tide` wordmark and the teal/coral tidal
palette are incumbent, not binding: they may change if the work justifies it. No logo files
beyond `public/icons/icon.svg`. Voice is plain, calm, and non-clinical.

## Evidence on Hand

- Screenshots: `docs/screenshots/{today,calendar}-{light,dark}.png`.
- No testimonials, user research, or usage data. Do not fabricate any.
- Public repo: <https://github.com/simonvanlierde/tide> (MIT).

## Product Principles

1. Privacy is visible, not just true: the interface should make "nothing leaves this device"
   legible without nagging.
2. Logging is the whole job; every other screen serves the glance, not the session.
3. Estimates look like estimates: predicted days are always visually distinct from logged facts.
4. Honest math beats confident math: show how a number was reached when it matters.
5. Works the same in five languages and two themes; no locale or theme is second-class.

## Accessibility & Inclusion

WCAG AA contrast is an established floor (tokens are annotated for it, axe runs in e2e).
Reduced-motion is honoured globally. Inclusive phrasing: users are "people who menstruate", not
assumed to be women.
