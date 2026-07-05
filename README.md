# Tide

[![CI](https://github.com/simonvanlierde/tide/actions/workflows/ci.yml/badge.svg)](https://github.com/simonvanlierde/tide/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/simonvanlierde/tide/branch/main/graph/badge.svg)](https://codecov.io/gh/simonvanlierde/tide)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Ftide.duinlab.nl)](https://tide.duinlab.nl)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8.svg)](https://tide.duinlab.nl)

Tide is a privacy-first period tracker — a small, local-first React PWA that keeps all cycle data in your browser.

> **Status:** work in progress. Core tracking is implemented, tested, and live.

## Install

Tide runs in the browser and installs as an app — no app store needed.

1. Open **[tide.duinlab.nl](https://tide.duinlab.nl)**.
2. Add it to your home screen:
   - **iOS (Safari):** Share → *Add to Home Screen*
   - **Android (Chrome):** menu (⋮) → *Install app*
   - **Desktop (Chrome/Edge):** install icon in the address bar

Once installed it works offline, and all data stays on your device.

## Features

- Log and remove bleeding days
- Current cycle day and phase (menstrual / follicular / ovulation / luteal)
- Next-period prediction, learned from history with a 28-day fallback
- Fertile-window estimate (approximate)
- Reminder before the predicted period, with snooze
- Month-by-month history calendar for reviewing and logging days
- Home screen with a tidal cycle dial showing your current day and phase at a glance
- Installable, offline-capable PWA
- All data stays on the device in `localStorage` — no accounts, no network, no analytics

## Roadmap

- Multi-language support
- light vs dark theme
- Calendar overlays: per-day period numbers and predicted ovulation / next-period markers
- consider: Just show calendar view on home screen and remove all other  views

## Development

Requires Node 24 and pnpm 10.

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

## Architecture

Cycle logic is kept pure and isolated from React and the browser, so it can be tested as plain functions:

- `src/domain` — pure cycle and reminder logic (no React, storage, or browser APIs)
- `src/data` — defaults, validation, and normalization at the `localStorage` boundary
- `src/state` — reducer and selectors, separate from the React provider
- `src/app` — app shell and pathname-based routing (`/`, `/history`, `/settings`)
- `src/features` — screen components and presentation helpers
- `src/ui` — reusable UI primitives
- `src/styles` — design tokens and shared styling
- `src/utils` — shared date helpers

Tests mirror this layering, with a thin Playwright e2e layer covering routing, persistence across reloads, and PWA smoke.

## Deployment

`pnpm build` outputs a static site to `dist/`, deployable to any static host.
