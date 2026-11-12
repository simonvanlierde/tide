# Tide

[![ts](https://github.com/simonvanlierde/tide/actions/workflows/ts.yml/badge.svg)](https://github.com/simonvanlierde/tide/actions/workflows/ts.yml)
[![codecov](https://codecov.io/gh/simonvanlierde/tide/branch/main/graph/badge.svg)](https://codecov.io/gh/simonvanlierde/tide)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Ftide.duinlab.nl)](https://tide.duinlab.nl)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8.svg)](https://tide.duinlab.nl)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/simonvanlierde/tide/badge)](https://scorecard.dev/viewer/?uri=github.com/simonvanlierde/tide)

Tide is a period tracker that keeps your data on your device. It's a web app you can
install on your phone. There's no account, and nothing you log is uploaded.

| Today | Calendar |
| --- | --- |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/today-dark.png"><img alt="Tide's Today screen" src="docs/screenshots/today-light.png" width="300"></picture> | <picture><source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/calendar-dark.png"><img alt="Tide's Calendar screen" src="docs/screenshots/calendar-light.png" width="300"></picture> |

## Install

Open **[tide.duinlab.nl](https://tide.duinlab.nl)** and add it to your home screen:

- **iOS (Safari):** Share → *Add to Home Screen*
- **Android (Chrome):** menu (⋮) → *Install app*
- **Desktop (Chrome/Edge):** install icon in the address bar

Once installed, it works offline.

## What it does

- Log today's period with one tap, edit any day in the calendar, or log a whole past period at once.
- Add symptoms, a mood and a short note to any day, with or without bleeding.
  These stay in your diary and don't change predictions.
- See your cycle day and phase on a dial, and the next period as an estimate.
  You can also choose to see an approximate fertile window.
  [How predictions work](docs/predictions.md) explains the rules, and Today shows the sums for your own dates.
- Review your last 12 cycle lengths. Mark a cycle incomplete when logs are missing, so it doesn't skew the estimate.
- Save your next expected periods as a calendar file.
- Import your history from Clue or Flo.

The estimates are for information only. They are not a form of birth control.

## Keep a backup

Your history lives in this browser only. Clearing the site's data deletes it, and Tide
doesn't sync between devices. Export a backup from **Settings → Data** and keep the file
somewhere private. Tide reminds you after 60 days.
[Save and restore a backup](docs/backups.md) has the steps and the file format.

## Docs

- [How predictions work](docs/predictions.md), and how they score on
  [real cycles](docs/backtest.md) and [sparse histories](docs/sparse-history.md)
- [Architecture](docs/architecture.md) and the [decision records](docs/adr/)
- [Development](docs/development.md): checks, translations, deploys and releases
- [Privacy](docs/privacy.md) and [accessibility](docs/accessibility.md) statements

## Development

You need Node.js 26 or newer, [pnpm](https://pnpm.io) and [just](https://just.systems).

```sh
pnpm install
pnpm exec playwright install chromium   # once per machine, for the e2e tests
pnpm exec prek install                  # git hooks
pnpm dev
```

`just check` runs what CI runs. [Development](docs/development.md) has the rest.
Bugs and ideas: [open an issue](https://github.com/simonvanlierde/tide/issues/new/choose)
or read [CONTRIBUTING.md](.github/CONTRIBUTING.md).

## License

[MIT](LICENSE) © Simon van Lierde
