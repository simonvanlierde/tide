# Contributing to Tide

[Open an issue](https://github.com/simonvanlierde/tide/issues/new/choose) for a bug or an idea, or
fork and open a pull request.

## Development

Requires Node 26, pnpm 12 and [just](https://just.systems).

```bash
pnpm install
pnpm exec playwright install chromium   # once per machine, for the e2e tests
pnpm exec prek install                  # git hooks: lint on commit, unit tests on push
pnpm dev
```

| Command | Description |
| --- | --- |
| `just check` | Lint and unused code (Biome, knip), types, tests, build, bundle budget, dependency audit; the CI gate |
| `just fmt` | Apply Biome's fixes and formatting |
| `just hooks` | Every git hook over the whole repo, as CI runs them |
| `just ts-cov` | Tests with coverage and its thresholds |
| `just ts-e2e` | Playwright tests against the production build: flows, accessibility, CSP, layout |
| `pnpm build` | Production build to `dist/` |

The repo follows the [project-templates](https://github.com/simonvanlierde/project-templates)
Copier template (`.copier-answers.yml`). `copier update` brings in its CI and tooling changes.

Commits follow [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `docs:`, …).

Things that trip people up:

- `vitest.config.ts` starts the test workers with `--no-experimental-webstorage`, so Node's own web storage does not get in the way of the test DOM.
- The largest JS file in `dist/assets` must stay under 100 KiB gzip (`scripts/checkBundleBudget.mjs`), so think twice before adding a heavy dependency.
- The Content-Security-Policy in `public/_headers` allows no inline script. Code that must run before first paint goes in a file under `public/`, like `public/theme.js`.
- Dependency overrides live in `pnpm-workspace.yaml`, not `package.json`. Read the comment next to an override before removing it.
- `pnpm-workspace.yaml` blocks releases younger than three days (`minimumReleaseAge`), and Dependabot waits a week. If a fresh version will not install, pick an older one.
- Seed storage explicitly in new e2e tests (`tests/e2e/seed.ts`). The preview server never reuses a running one, and a cold build can take up to 180 s.
- CI runs e2e in the Playwright image whose tag matches the `@playwright/test` version in the lockfile, so a Playwright bump needs no workflow edit.

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

- **Static lint:** Biome's `a11y` rules (`biome.json`) run as part of `just check`.
- **Runtime axe checks:** `tests/e2e/a11y.spec.ts` runs [axe-core](https://github.com/dequelabs/axe-core) against `/`, `/calendar`, and `/settings`, in both themes and with overlays open. It checks WCAG 2.0, 2.1 and 2.2 at levels A and AA plus axe's best-practice rules, and fails on any violation, whatever its impact. `tests/e2e/reflow.spec.ts` checks that no route scrolls sideways at 320 px. Run them with `just ts-e2e`.

## Running your own copy

Tide has no backend, so a fork needs no infrastructure. `pnpm build` writes a static site to
`dist/`, and any static host will serve it as-is.

**[tide.duinlab.nl](https://tide.duinlab.nl)** builds from `main` on Cloudflare Pages, so a merged
pull request ships on its own. [`wrangler.jsonc`](wrangler.jsonc) pins the output directory for
that setup; other hosts need nothing from the repo.
