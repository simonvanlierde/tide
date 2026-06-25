# Tide

[![CI](https://github.com/simonvanlierde/tide/actions/workflows/ci.yml/badge.svg)](https://github.com/simonvanlierde/tide/actions/workflows/ci.yml)

Tide is a privacy-first period tracker — a small, local-first React PWA that keeps all cycle data in your browser.

> **Status:** work in progress. Core tracking is implemented and tested; not yet publicly deployed.

## Features

- Log and remove bleeding days
- Current cycle day and phase (menstrual / follicular / ovulation / luteal)
- Next-period prediction, learned from history with a 28-day fallback
- Fertile-window estimate (approximate)
- Reminder before the predicted period, with snooze
- Month-by-month history calendar for reviewing and logging days
- Three home views: summary, linear (timeline), and circular (dial)
- Installable, offline-capable PWA
- All data stays on the device in `localStorage` — no accounts, no network, no analytics

## Roadmap

- Multi-language support
- Calendar overlays: per-day period numbers and predicted ovulation / next-period markers
- Public deployment

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

## Data model

App state is a single JSON object in `localStorage` under `tide.period-tracker.state`; `src/data/schema.ts` is the source of truth:

```ts
interface AppState {
  periodDays: IsoDate[];
  settings: {
    reminderWindowDays: number;
    snoozedUntil: IsoDate | null;
    homeDisplayMode: "summary" | "linear" | "circular";
  };
}
```

State is normalized on read, so malformed or legacy data can't crash the app: dates are validated, deduplicated, and sorted; unknown settings fall back to defaults; invalid JSON falls back to the default state.

## Deployment

Tide builds to static files (`pnpm build` → `dist/`) hosted on Cloudflare Pages: connect the repo, set the build command to `pnpm build` and the output directory to `dist`, then push to `main` to deploy. `public/_redirects` keeps direct visits to `/history` and `/settings` working.
