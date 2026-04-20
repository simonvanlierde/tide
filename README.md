# Tide

Tide is a privacy-first period tracker PWA built as a small local-first React app. It keeps cycle data in the browser, ships as a static site on Cloudflare Pages, and treats app simplicity as a feature rather than an afterthought.

## Why It Is Interesting

- Local-first product design: no backend, sync layer, or account system
- Focused domain logic: cycle estimates and reminders stay in pure modules
- Small-but-serious quality bar: typed React app, layered tests, bundle budget, and smoke E2E coverage
- Static deployment path: standard Vite build, PWA assets, and Cloudflare Pages deploy

## Local Setup

Tide targets Node 24 and pnpm 10.

```bash
pnpm install
pnpm dev
```

Useful commands:

- `pnpm test`
- `pnpm test:e2e`
- `pnpm build`
- `pnpm check`

## Architecture

The codebase is intentionally split into a few small boundaries:

- `src/domain` for pure cycle and reminder logic
- `src/data` for storage defaults, validation, and normalization
- `src/state` for the single React state surface and derived cycle summary hook
- `src/app` for the shell and pathname-based navigation
- `src/features` for screen components and presentation helpers

Supporting details live in [docs/architecture.md](docs/architecture.md) and [docs/data-model.md](docs/data-model.md).

## Testing

The test suite stays layered without getting heavy:

- `tests/domain` for pure logic
- `tests/data` for storage normalization
- `tests/state` for reducer and provider behavior
- `tests/ui` for mounted screen behavior
- `tests/e2e` for a thin Playwright smoke layer

`pnpm check` is the main local and CI acceptance command. Playwright smoke tests run separately on `main` and manual workflow runs.

## Deployment

Tide deploys to Cloudflare Pages as a static site.

1. Create a Pages project named `tide`.
2. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as GitHub repository secrets.
3. Push to `main` to trigger the deploy workflow.

For manual deploys:

```bash
pnpm build
pnpm dlx wrangler pages deploy dist --project-name=tide
```

`wrangler.toml` defines the Pages output directory, and `public/_redirects` preserves direct visits to `/history` and `/settings`.
