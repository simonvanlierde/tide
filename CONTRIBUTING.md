# Contributing to Tide

[Open an issue](https://github.com/simonvanlierde/tide/issues/new/choose) for a bug or an idea, or
fork and open a pull request.

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

Commits follow [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `docs:`, …).

Things that trip people up:

- Run DOM tests through the package scripts (`pnpm test`, `pnpm test:coverage`). They set `NODE_OPTIONS=--no-experimental-webstorage`, so Node's own web storage does not get in the way of the test DOM.
- The largest JS file in `dist/assets` must stay under 100 KiB gzip (`scripts/checkBundleBudget.mjs`), so think twice before adding a heavy dependency.
- `public/_headers` must keep the `__INLINE_SCRIPT_HASHES__` placeholder. `scripts/writeCspHeaders.mjs` fills it in at build time and the build throws without it.
- Dependency overrides live in `pnpm-workspace.yaml`, not `package.json`. Read the comment next to an override before removing it.
- `pnpm-workspace.yaml` blocks releases younger than three days (`minimumReleaseAge`). If a fresh version will not install, pick an older one.
- Seed storage explicitly in new e2e tests (`tests/e2e/seed.ts`). The preview server never reuses a running one, and a cold build can take up to 180 s.
- CI runs e2e in the Playwright image `v1.64.0-noble`. Keep `@playwright/test` in `package.json` on the same version as that tag.

## Architecture

I keep the cycle logic pure and away from React and the browser, so it can be tested as plain functions. Dependencies point inward. The React layer reads through `state`, and `state` is the only code that calls the pure `domain` and the `data` layer, where data is saved and loaded:

- `src/domain`: pure cycle and reminder logic (no React, storage, or browser APIs)
- `src/data`: defaults, validation, and normalization at the `localStorage` boundary
- `src/state`: reducer and selectors, separate from the React provider
- `src/app`: app shell and pathname-based routing (`/`, `/calendar`, `/settings`)
- `src/features`: screen components and presentation helpers
- `src/i18n`: typed message dictionaries, one per locale
- `src/ui`: reusable UI primitives
- `src/styles`: design tokens and shared styling
- `src/utils`: shared date helpers

The tests follow the same layers. On top sits a thin layer of Playwright end-to-end tests: routing, data that survives a reload, and a smoke test of the PWA.

[docs/adr/0001-local-first-no-backend.md](docs/adr/0001-local-first-no-backend.md) records why all data stays on the device. [CHANGELOG.md](CHANGELOG.md) lists the releases.

## Accessibility

Two automated checks run in CI:

- **Static lint:** Biome's `a11y` rules (`biome.json`) run as part of `pnpm lint` / `pnpm check`.
- **Runtime axe checks:** `tests/e2e/a11y.spec.ts` runs [axe-core](https://github.com/dequelabs/axe-core) against `/`, `/calendar`, and `/settings`, in both themes and with overlays open. It checks the rules tagged `wcag2a`/`wcag2aa`, and fails on any violation rated *moderate* or worse. Run it with `pnpm test:e2e`.

## Running your own copy

Tide has no backend, so a fork needs no infrastructure. `pnpm build` writes a static site to
`dist/`, and any static host will serve it as-is.

**[tide.duinlab.nl](https://tide.duinlab.nl)** builds from `main` on Cloudflare Pages, so a merged
pull request ships on its own. [`wrangler.jsonc`](wrangler.jsonc) pins the output directory for
that setup; other hosts need nothing from the repo.
