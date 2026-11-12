# Development

The [README](../README.md#development) installs the tools and starts the app.
[CONTRIBUTING.md](../.github/CONTRIBUTING.md) has the commit, sign-off and release rules.

## Commands

| Command | What it does |
| --- | --- |
| `just check` | The CI gate: Biome and knip, types, tests, build, bundle budget and dependency audit |
| `just fmt` | Apply Biome's fixes and formatting |
| `just hooks` | Every git hook over the whole repo, as CI runs them |
| `just ts-cov` | Tests with coverage and its thresholds |
| `just ts-e2e` | Playwright tests against the production build: flows, accessibility, CSP and layout |
| `just ts-shots` | Screenshots of every route at several widths and in both themes, into `shots/` |
| `just repo-settings` | Apply the rulesets, environments and repo settings (maintainers) |
| `pnpm build` | Production build to `dist/` |
| `pnpm benchmark` | Time the cycle model on long histories ([results](performance.md)) |
| `pnpm backtest` | Score predictions on a public cycle dataset ([results](backtest.md)) |
| `pnpm validate:sparse` | Stress-test predictions on synthetic sparse histories ([results](sparse-history.md)) |

The repo follows the [project-templates](https://github.com/simonvanlierde/project-templates)
Copier template (`.copier-answers.yml`). `copier update` brings in its CI and tooling changes.
[Architecture](architecture.md) describes the code layers and how data moves through them.

## Things that trip people up

- The test workers start with `--no-experimental-webstorage` (`vitest.config.ts`), so Node's own web storage stays out of the test DOM.
- The largest JS file in `dist/assets` must stay under 128 KiB gzip (`scripts/checkBundleBudget.mjs`). The budget keeps at least 25% headroom. When a change goes over it, find what grew before you raise it.
- The Content-Security-Policy in `public/_headers` allows no inline script. Code that must run before first paint goes in a file under `public/`, like `public/theme.js`.
- Dependency overrides live in `pnpm-workspace.yaml`, not `package.json`. Read the comment next to an override before you remove it.
- pnpm installs only releases at least a week old (`minimumReleaseAge`), and Dependabot waits a week too. If a fresh version won't install, pick an older one.
- New e2e tests seed storage explicitly (`tests/e2e/seed.ts`). The preview server never reuses a running one, and a cold build can take up to 180 s.
- CI runs e2e in the Playwright image that matches the `@playwright/test` version in the lockfile, so a Playwright bump needs no workflow edit.

## Accessibility checks

- Biome's `a11y` rules (`biome.json`) run in `just check`.
- `tests/e2e/a11y.spec.ts` runs [axe-core](https://github.com/dequelabs/axe-core) on `/`, `/calendar`
  and `/settings`, in both themes and with overlays open. It checks WCAG 2.0, 2.1 and 2.2 A and AA
  plus axe's best-practice rules, and fails on any violation.
- `tests/e2e/reflow.spec.ts` checks that no route scrolls sideways at 320 px.

The [self-assessment](accessibility-assessment.md) covers what these checks can't.

## Translations

Tide ships five languages as Lingui 6 PO catalogs in `src/i18n/locales/`. The forecast
explainer has its own catalogs in `src/features/today/locales/`.
[ADR 0002](adr/0002-lingui-catalogs.md) records the choice.

- Edit each locale by hand, English included, and keep the explicit message IDs.
- Write plurals in ICU form: `{n, plural, one {...} other {...}}`.
- Don't run `lingui extract`. Some IDs are picked at runtime, so the catalogs are the source.
- Run `pnpm i18n:compile` after an edit, then restart the dev server. Dev, tests and builds also compile first.

The compiled `.mjs` files stay out of Git. `pnpm i18n:compare` checks every message and plural
form against the commit before the Lingui migration; `pnpm i18n:compare <git-ref>` uses another baseline.

## Social card

`public/og.png` is the 1200x630 image shown when someone shares the link. Its source is
[`og-card.html`](og-card.html). The ring in it, `og-ring.png`, is the app's own cycle dial with
sample cycles. After you change the card or the dial, render both again. This needs Playwright Chromium.

```sh
pnpm og-card
```

## Deploy

Tide has no backend. `pnpm build` writes a static site to `dist/`, and any static host can serve
it as is. A fork needs nothing else.

[tide.duinlab.nl](https://tide.duinlab.nl) runs on a Cloudflare Worker that serves the build as
static assets, configured in [`wrangler.jsonc`](../wrangler.jsonc). Every push to `main` deploys the
build the checks ran on. [`public/_headers`](../public/_headers) sets the response headers, including
the Content-Security-Policy the e2e tests run under. Until the custom domain moves to the Worker,
the Cloudflare Pages project that builds `main` still serves tide.duinlab.nl.

One-time setup, for production and previews:

1. Run `just repo-settings`. It creates the `production` and `preview` environments and limits `production` to `main`.
2. Add the secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to both environments, not to the repository.
   The token is a custom token with Account > Workers Scripts: Edit.
3. Give the Cloudflare account a workers.dev subdomain, if it has none yet.

Without the token, the deploy jobs skip with a notice.

To roll back, revert the commit on `main`, or re-run an earlier production job while its build
artifact still exists (7 days). The build you roll back to must read the stored schema.
Version 0.4.0 can't read the storage that 0.5.0 copies your data into, so a rollback to it shows
only the old copy, without later logs or diary entries. Export current data before a rollback.
[Upgrading an existing installation](backups.md#upgrading-an-existing-installation) explains the copy and older tabs.

### Pull request previews

Each open pull request that isn't a draft or from a bot gets its own Worker, `tide-pr-<number>`.
It deploys from the same `wrangler.jsonc` under that name. The Worker is deleted when the pull
request closes or turns back to draft
([how it works](https://github.com/simonvanlierde/project-templates/blob/main/docs/usage.md#pull-request-previews)).
Previews are public: anyone with the address can open one.
