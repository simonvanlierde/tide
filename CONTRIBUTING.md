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
