# Tide

[![CI](https://github.com/simonvanlierde/tide/actions/workflows/ci.yml/badge.svg)](https://github.com/simonvanlierde/tide/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/simonvanlierde/tide/branch/main/graph/badge.svg)](https://codecov.io/gh/simonvanlierde/tide)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Ftide.duinlab.nl)](https://tide.duinlab.nl)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8.svg)](https://tide.duinlab.nl)

Tide is a privacy-first period tracker. It's a small React web app that you can install (a PWA),
and it keeps all your cycle data in your browser.

| Today | Calendar |
| --- | --- |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/today-dark.png"><img alt="Tide's Today screen" src="docs/screenshots/today-light.png" width="300"></picture> | <picture><source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/calendar-dark.png"><img alt="Tide's Calendar screen" src="docs/screenshots/calendar-light.png" width="300"></picture> |

## Install

Tide runs in the browser. You can install it as an app without an app store.

1. Open **[tide.duinlab.nl](https://tide.duinlab.nl)**.
2. Add it to your home screen:
   - **iOS (Safari):** Share → *Add to Home Screen*
   - **Android (Chrome):** menu (⋮) → *Install app*
   - **Desktop (Chrome/Edge):** install icon in the address bar

Once installed, it works offline, and all data stays on your device.

## Features

- **Log bleeding days**: add or remove a day with one tap, or log a whole past period at once
- **Today at a glance**: a tidal cycle dial shows your current day and phase (menstrual /
  follicular / ovulation / luteal). Drag along the dial to preview other days
- **Predictions**: Tide learns your next period from your history, and uses 28 days until it can.
  If you choose to see them, it also shows an approximate fertile window and ovulation estimate.
  Every prediction is drawn as a dashed outline, so it never looks like a logged day
- **Cycle insights**: your average cycle and period lengths, the number of cycles tracked, and a
  regularity meter, with a plain-language note on how the predictions are worked out
- **Calendar**: a month-by-month view with cycle day numbers and fertile / ovulation / next-period
  markers. Use it to look back and to log days
- **Import & export**: back up your data to a JSON file, restore it on any device, or delete
  everything in one go
- **Bring your history**: import a Clue or Flo export from Settings → Data → Import. Tide reads
  the bleeding and spotting days and adds them to the days you already logged, which stay as they
  are. From Clue, pick `measurements.json` from the export zip, or an older `.cluedata` backup.
  Flo days keep the flow level Flo recorded. A day without one imports as a plain log. A Tide
  backup replaces your data instead.
- **Private by design**: an installable PWA that works offline. All data stays on the device, with
  no accounts, no network and no analytics

### How predictions work

Tide works out every estimate on your device, from the bleeding days you log. Nothing leaves your
device.

- **Cycles.** A gap of **10+ days** between logged bleeding days starts a new cycle. A shorter gap
  counts as missed logs within the same period.
- **Cycle length.** The **median of your last 6 completed cycles**, counted in days between
  starts. I use the median so one odd cycle doesn't skew it, and only recent cycles because cycle
  length drifts. Until you've logged two period starts (one full cycle), Tide uses **28 days**.
- **Period length.** The average of your past periods, kept within the **2–7 day** range that ACOG
  (the American College of Obstetricians and Gynecologists) gives as normal. It leaves out the
  current, unfinished period, and uses **4 days** when there's no history.
- **Next period.** The most recent cycle start plus the estimated cycle length.
- **Ovulation.** **14 days before** the next predicted period, because the luteal phase (the part
  after ovulation) varies least from cycle to cycle. Calendar math can't do better without
  temperature or LH-test input, and Tide doesn't collect those.
- **Fertile window.** From 5 days before ovulation to 1 day after, because sperm survive about
  5 days and the egg about 1. It **widens with the standard deviation of your recent cycles**
  (capped at ±5 days), so it stays tight for regular cycles and gets wider for irregular ones.

To see how close the next-period estimate lands on real cycle data, read
[docs/backtest.md](docs/backtest.md).

The estimates are for information only. They are not a form of birth control.

## Roadmap

- **Symptoms and mood**: log cramps, headaches and mood alongside bleeding
- **App lock**: an optional passcode or biometric lock, for a phone that gets handed around

## Contributing

Help and suggestions are welcome.
[Open an issue](https://github.com/simonvanlierde/tide/issues/new/choose) to report a bug or suggest
a feature, or send a pull request to fix one yourself. See [CONTRIBUTING.md](CONTRIBUTING.md) for
setup, architecture, and the dev workflow.

## License

[MIT](LICENSE) © Simon van Lierde
