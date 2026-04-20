# Tide

Tide is a local-first period tracker PWA with on-device storage and versioned JSON backup import/export.

## Features

- Log bleeding days
- View cycle summaries and timelines
- Get reminders with snooze controls
- Keep data private and client-only

## Run

Tide targets Node 24 and pnpm 10.

```bash
pnpm install
pnpm dev
```

Common commands:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`
- `pnpm check`

`just` wrappers are also available for the same flows.

## Data

- App state lives in `localStorage` under `tide.period-tracker.state`
- Stored state and backups use a versioned schema
- Invalid or duplicate period dates are sanitized during load/import

See [docs/architecture.md](docs/architecture.md) and [docs/data-model.md](docs/data-model.md) for the current structure.

## Architecture

The app is split across `src/domain`, `src/data`, `src/state`, `src/features`, and `src/ui`.
No backend, sync, auth, or analytics.

## Testing

Tests live in `tests/domain`, `tests/data`, `tests/ui`, `tests/state`, and `tests/e2e`.
CI runs install, typecheck, lint, test, and build on pull requests, with Playwright smoke tests and Docker builds on `main` and manual runs.

## Deployment

Static hosting for `dist/` is the simplest production setup.
Container files: `Dockerfile`, `Caddyfile`, and `compose.yaml`.

Tunnel example:

```bash
docker compose --profile=tunnel up -d --build
```

For the tunnel profile, copy `.env.example` to `.env` and set `CLOUDFLARE_TUNNEL_TOKEN`.
