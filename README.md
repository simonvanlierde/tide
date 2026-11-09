# Tide

[![ts](https://github.com/simonvanlierde/tide/actions/workflows/ts.yml/badge.svg)](https://github.com/simonvanlierde/tide/actions/workflows/ts.yml)
[![codecov](https://codecov.io/gh/simonvanlierde/tide/branch/main/graph/badge.svg)](https://codecov.io/gh/simonvanlierde/tide)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Ftide.duinlab.nl)](https://tide.duinlab.nl)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8.svg)](https://tide.duinlab.nl)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/simonvanlierde/tide/badge)](https://scorecard.dev/viewer/?uri=github.com/simonvanlierde/tide)

Tide is a privacy-first period tracker. It's a small React web app that you can install (a PWA),
and it keeps all your cycle data in your browser: no accounts, no network and no analytics.

| Today | Calendar |
| --- | --- |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/today-dark.png"><img alt="Tide's Today screen" src="docs/screenshots/today-light.png" width="300"></picture> | <picture><source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/calendar-dark.png"><img alt="Tide's Calendar screen" src="docs/screenshots/calendar-light.png" width="300"></picture> |

## Install

Open **[tide.duinlab.nl](https://tide.duinlab.nl)** and add it to your home screen:

- **iOS (Safari):** Share → *Add to Home Screen*
- **Android (Chrome):** menu (⋮) → *Install app*
- **Desktop (Chrome/Edge):** install icon in the address bar

Once installed, it works offline, and all data stays on your device.

## Features

- Log bleeding days with one tap, or a whole past period at once.
- A cycle dial shows today's cycle day and phase. Drag along it to preview other days.
- Next-period estimates, and if you choose to see them, an approximate fertile window and
  ovulation estimate. Every prediction is a dashed outline, so it never looks like a logged day.
  [How predictions work](docs/predictions.md), and Today shows the sums behind your own date.
- Save your next expected periods as a calendar file for any calendar app.
- Insights, and a calendar with cycle day numbers.
- Back up to a JSON file, restore it on any device, or delete everything in one go.
- Import a Clue export (`measurements.json` from the export zip, or an older `.cluedata` backup)
  or a Flo export from Settings → Data → Import. It adds to the days you already logged; a Tide
  backup replaces your data instead.

The estimates are for information only. They are not a form of birth control.

## Development

You need [just](https://just.systems) and [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm exec playwright install chromium   # once per machine, for the e2e tests
pnpm exec prek install                  # git hooks
```

`pnpm dev` starts the app. `just check` runs what CI runs, and `just ts-e2e` the browser tests.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the checks and architecture,
[docs/](docs/) for the [architecture](docs/architecture.md), the [prediction backtest](docs/backtest.md) and the
[decision to keep data on the device](docs/adr/0001-local-first-no-backend.md).
[Open an issue](https://github.com/simonvanlierde/tide/issues/new/choose) for bugs and ideas.

## Deploy

The app runs on a Cloudflare Worker that serves the build as static assets, configured in
[`wrangler.jsonc`](wrangler.jsonc). CI deploys it: every push to `main` deploys the build the
checks ran on. [`public/_headers`](public/_headers) sets the response headers, including the
Content-Security-Policy that the e2e tests run under. Until the custom domain moves to the Worker,
<https://tide.duinlab.nl> is still served by the Cloudflare Pages project that builds `main`.

One-time setup, for production and previews alike:

1. Run `just repo-settings` to create the `production` and `preview` environments, with
   `production` limited to `main`.
2. Add the secrets `CLOUDFLARE_API_TOKEN` (a custom token with Account > Workers Scripts: Edit)
   and `CLOUDFLARE_ACCOUNT_ID` to both environments, not to the repository.
3. Give the Cloudflare account a workers.dev subdomain, if it has none yet.

Without the token, the deploy jobs skip with a notice. To roll back, revert the commit on `main`,
or re-run an earlier run's production job while its build artifact exists (7 days).

### Pull request previews

Each pull request that is open, not a draft and not from a bot gets its own Cloudflare Worker,
`tide-pr-<number>`, deployed from the same `wrangler.jsonc` under that name and deleted again when
the pull request closes or turns draft
([how it works](https://github.com/simonvanlierde/project-templates/blob/main/docs/usage.md#pull-request-previews)).
Previews are public: anyone with the address can open one.

## License

[MIT](LICENSE) © Simon van Lierde
