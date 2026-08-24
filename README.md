# Tide

[![CI](https://github.com/simonvanlierde/tide/actions/workflows/ci.yml/badge.svg)](https://github.com/simonvanlierde/tide/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/simonvanlierde/tide/branch/main/graph/badge.svg)](https://codecov.io/gh/simonvanlierde/tide)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Ftide.duinlab.nl)](https://tide.duinlab.nl)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8.svg)](https://tide.duinlab.nl)

Tide is a privacy-first period tracker: a small, local-first React PWA that keeps all cycle data in
your browser.

| Today | Calendar |
| --- | --- |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/today-dark.png"><img alt="Tide's Today screen" src="docs/screenshots/today-light.png" width="300"></picture> | <picture><source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/calendar-dark.png"><img alt="Tide's Calendar screen" src="docs/screenshots/calendar-light.png" width="300"></picture> |

## Install

Tide runs in the browser and installs as an app, no app store needed.

1. Open **[tide.duinlab.nl](https://tide.duinlab.nl)**.
2. Add it to your home screen:
   - **iOS (Safari):** Share → *Add to Home Screen*
   - **Android (Chrome):** menu (⋮) → *Install app*
   - **Desktop (Chrome/Edge):** install icon in the address bar

Once installed it works offline, and all data stays on your device.

## Features

- **Log bleeding days**: add or remove with one tap
- **Today at a glance**: a tidal cycle dial showing your current day and phase (menstrual /
  follicular / ovulation / luteal) and a scrub preview
- **Predictions**: next period learned from your history (28-day fallback), plus an approximate
  fertile window and ovulation estimate
- **Cycle insights**: your average cycle and period lengths, cycles tracked, and a regularity meter,
  with a plain-language note on how predictions are worked out
- **Calendar**: month-by-month view with cycle day numbers and fertile / ovulation / next-period
  markers, for reviewing and logging days
- **Import & export**: back up your data to a JSON file, restore it on any device, or delete
  everything in one go
- **Private by design**: installable, offline-capable PWA; all data stays on the device; no
  accounts, no network, no analytics

### How predictions work

Every estimate is computed on-device from the bleeding days you log. Nothing leaves your device.

- **Cycles.** A gap of **10+ days** between logged bleeding days starts a new cycle; shorter gaps
  are missed logs within the same period.
- **Cycle length.** The **median of your last 6 completed cycles** (days between starts). Median so
  one odd cycle doesn't skew it; recent cycles only, since cycle length drifts. Falls back to
  **28 days** until you've logged two cycles.
- **Period length.** Average of past periods, clamped to the **2–7 day** normal band (ACOG). Ignores
  the current, unfinished period; defaults to **4 days** with no history.
- **Next period.** Most recent cycle start plus the estimated cycle length.
- **Ovulation.** **14 days before** the next predicted period; the luteal phase is the cycle's least
  variable part. Calendar math can't do better without temperature or LH-test input, which Tide
  doesn't collect.
- **Fertile window.** The 5 days before through 1 day after ovulation (sperm survive ~5 days, the
  egg ~1). It **widens with the standard deviation of your recent cycles** (capped at ±5 days):
  tight for regular cycles, wider for irregular ones.

Estimates are informational, not a form of birth control.

## Roadmap

- **Bring your history from another app**: import a Clue or Flo export, not just a Tide backup
- **Symptoms and mood**: log cramps, headaches and mood alongside bleeding
- **App lock**: an optional passcode or biometric lock, for a phone that gets handed around

## Contributing

Help and suggestions are welcome.
[Open an issue](https://github.com/simonvanlierde/tide/issues/new/choose) to report a bug or suggest
a feature, or send a pull request to fix one yourself. See [CONTRIBUTING.md](CONTRIBUTING.md) for
setup, architecture, and the dev workflow.

## License

[MIT](LICENSE) © Simon van Lierde
