# Product

## Platform

web

## Users

Tide is for people who menstruate and want to leave a mainstream period tracker (Flo, Clue
and similar) because of what it does with their data. They come with history they want to
keep, and they distrust anything that looks like it phones home. Tide sits on the home
screen and gets a few seconds at a time: log today, check the cycle day, and now and then
look back through the calendar.

Second: people who read Dutch, German, French or Spanish. The app ships in all five
languages.

## Product Purpose

Tide is a period tracker built for privacy, and your data stays on your device. You
log the days you bleed, and if you like, how heavily. It shows the current cycle day and
phase, when the next period is expected, an ovulation estimate and a fertile window. It
works out every number on the device.

It works when people trust that nothing leaves the device, log every time because it takes
no effort, and find the forecast good enough to plan around.

## Positioning

No account, no network, no analytics, and nothing in the bundle that could send data out.
The README and the app explain the prediction model in plain language, so you can check the
sums yourself instead of trusting a black box. A plain JSON file is the way in and the way
out: import it to bring your history, export it to leave.

## Operating Context

- It installs to the home screen as a progressive web app (PWA) on iOS Safari, Android
  Chrome and desktop Chromium, and works offline.
- There are three screens behind a bottom tab bar: Today, Calendar, Settings.
- Today asks you to log when a period is expected or overdue and the day isn't logged yet.
- State lives in `localStorage` under `tide.period-tracker.state`. The theme is picked
  before the first paint, so the app never flashes the wrong one.
- It runs at <https://tide.duinlab.nl> (Cloudflare; see `wrangler.jsonc`).

## Capabilities and Constraints

- The cycle model is in `src/domain/cycle.ts`, and the README explains it under "How
  predictions work". Those two are the source of truth, so don't repeat their numbers here.
- Every estimate is an estimate. Fertility estimates stay hidden until you answer a one-time
  question on Today, and you can change the answer later with the Settings switch. The note
  that they are not birth control sits next to the fertility line, not only in Settings.
- Five locales as typed dictionaries, with dates and plurals through `Intl`. German and
  French run long and still have to fit.
- Light and dark themes, following the system or a manual choice.
- CI checks bundle size, coverage, and accessibility with axe in the end-to-end tests.
- Words we use: "bleeding" or "period" for what you log, "cycle day", "phase" (menstrual,
  follicular, ovulation, luteal), "fertile window", and "expected" for a predicted day.

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
