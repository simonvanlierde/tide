# Tide

[![CI](https://github.com/simonvanlierde/tide/actions/workflows/ci.yml/badge.svg)](https://github.com/simonvanlierde/tide/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/simonvanlierde/tide/branch/main/graph/badge.svg)](https://codecov.io/gh/simonvanlierde/tide)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Ftide.duinlab.nl)](https://tide.duinlab.nl)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8.svg)](https://tide.duinlab.nl)

Tide is a privacy-first period tracker — a small, local-first React PWA that keeps all cycle data in your browser.

<p align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/today-dark.png">
  <img alt="Tide's Today screen" src="docs/screenshots/today-light.png" width="300">
</picture>
</p>

## Install

Tide runs in the browser and installs as an app — no app store needed.

1. Open **[tide.duinlab.nl](https://tide.duinlab.nl)**.
2. Add it to your home screen:
   - **iOS (Safari):** Share → *Add to Home Screen*
   - **Android (Chrome):** menu (⋮) → *Install app*
   - **Desktop (Chrome/Edge):** install icon in the address bar

Once installed it works offline, and all data stays on your device.

## Features

- **Log bleeding days**: add or remove with one tap
- **Today at a glance**: a tidal cycle dial showing your current day and phase (menstrual / follicular / ovulation / luteal), with key cycle dates and a scrub preview
- **Predictions**: next period learned from your history (28-day fallback), plus an approximate fertile window and ovulation estimate
- **Log reminders**: a one-tap prompt in the days around your predicted period
- **Calendar**: month-by-month view with per-day period numbers and ovulation / next-period markers, for reviewing and logging days
- **Private by design**: installable, offline-capable PWA; all data stays on the device; no accounts, no network, no analytics

## Roadmap

- Improved onboarding UI / UX
- Multi-language support

## Development

Requires Node 26 and pnpm 11.

```bash
pnpm install
pnpm dev
```

| Command | Description |
| --- | --- |
| `pnpm check` | Typecheck, lint, tests, build, and bundle-size budget — the CI gate |
| `pnpm test` | Unit and UI tests |
| `pnpm test:e2e` | Playwright smoke tests |
| `pnpm build` | Production build to `dist/` |

### Accessibility

Two automated checks run in CI:

- **Static lint:** Biome's `a11y` rules (`biome.json`) run as part of `pnpm lint` / `pnpm check`.
- **Runtime axe checks:** `tests/e2e/a11y.spec.ts` runs [axe-core](https://github.com/dequelabs/axe-core) against `/`, `/history`, and `/settings`;  both themes, with overlays open, tagged `wcag2a`/`wcag2aa`, failing on any *moderate*+ violation. Run with `pnpm test:e2e`.

## Architecture

Cycle logic is kept pure and isolated from React and the browser, so it can be tested as plain functions. Dependencies point inward — the React layer reads through `state`, which is the only caller of the pure `domain` and the `data` persistence boundary:

- `src/domain` — pure cycle and reminder logic (no React, storage, or browser APIs)
- `src/data` — defaults, validation, and normalization at the `localStorage` boundary
- `src/state` — reducer and selectors, separate from the React provider
- `src/app` — app shell and pathname-based routing (`/`, `/history`, `/settings`)
- `src/features` — screen components and presentation helpers
- `src/ui` — reusable UI primitives
- `src/styles` — design tokens and shared styling
- `src/utils` — shared date helpers

Tests mirror this layering, with a thin Playwright e2e layer covering routing, persistence across reloads, and PWA smoke.

The core design decision — keeping all data on-device with no backend — is recorded in [docs/adr/0001-local-first-no-backend.md](docs/adr/0001-local-first-no-backend.md). Releases are tracked in [CHANGELOG.md](CHANGELOG.md).

## Deployment

**[tide.duinlab.nl](https://tide.duinlab.nl)** is hosted on Cloudflare Pages via its Git
integration: a push to `main` triggers a build (`pnpm build`) that publishes `dist/`. The build
command and preview settings live in the Cloudflare dashboard; the repo only pins the output
directory in [`wrangler.jsonc`](wrangler.jsonc).

To deploy from a local checkout: `pnpm deploy` (`wrangler pages deploy`).

## License

[MIT](LICENSE) © Simon van Lierde
