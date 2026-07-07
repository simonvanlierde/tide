# Contributing to Tide

Thanks for helping out. Bug reports, ideas, and pull requests are all welcome.

- **Found a bug or have an idea?** [Open an issue](https://github.com/simonvanlierde/tide/issues/new/choose).
- **Want to fix it yourself?** Fork, make your change, and open a pull request.

## Development

Requires Node 26 and pnpm 11.

```bash
pnpm install
pnpm dev
```

| Command | Description |
| --- | --- |
| `pnpm check` | Typecheck, lint, tests, build, and bundle-size budget; the CI gate |
| `pnpm test` | Unit and UI tests |
| `pnpm test:e2e` | Playwright smoke tests |
| `pnpm build` | Production build to `dist/` |

Run `pnpm check` before opening a PR; it's the same gate CI runs.

Commits follow [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `docs:`, …).

## Architecture

Cycle logic is kept pure and isolated from React and the browser, so it can be tested as plain functions. Dependencies point inward; the React layer reads through `state`, which is the only caller of the pure `domain` and the `data` persistence boundary:

- `src/domain`: pure cycle and reminder logic (no React, storage, or browser APIs)
- `src/data`: defaults, validation, and normalization at the `localStorage` boundary
- `src/state`: reducer and selectors, separate from the React provider
- `src/app`: app shell and pathname-based routing (`/`, `/calendar`, `/settings`)
- `src/features`: screen components and presentation helpers
- `src/ui`: reusable UI primitives
- `src/styles`: design tokens and shared styling
- `src/utils`: shared date helpers

Tests mirror this layering, with a thin Playwright e2e layer covering routing, persistence across reloads, and PWA smoke.

The core design decision, keeping all data on-device with no backend, is recorded in [docs/adr/0001-local-first-no-backend.md](docs/adr/0001-local-first-no-backend.md). Releases are tracked in [CHANGELOG.md](CHANGELOG.md).

## Accessibility

Two automated checks run in CI:

- **Static lint:** Biome's `a11y` rules (`biome.json`) run as part of `pnpm lint` / `pnpm check`.
- **Runtime axe checks:** `tests/e2e/a11y.spec.ts` runs [axe-core](https://github.com/dequelabs/axe-core) against `/`, `/calendar`, and `/settings`; both themes, with overlays open, tagged `wcag2a`/`wcag2aa`, failing on any *moderate*+ violation. Run with `pnpm test:e2e`.

## Deployment

**[tide.duinlab.nl](https://tide.duinlab.nl)** is hosted on Cloudflare Pages via its Git
integration: a push to `main` triggers a build (`pnpm build`) that publishes `dist/`. The build
command and preview settings live in the Cloudflare dashboard; the repo only pins the output
directory in [`wrangler.jsonc`](wrangler.jsonc).

To deploy from a local checkout: `pnpm deploy` (`wrangler pages deploy`).
