# Tide

Tide is a privacy-first period tracker PWA. It is a small local-first React app that stores cycle data in the browser and deploys as a static site on Cloudflare Pages.

## Local Setup

Tide targets Node 24 and pnpm 10.

```bash
pnpm install
pnpm dev
```

Core commands:

- `pnpm check` runs typecheck, lint, unit/UI tests, build, and the bundle budget check
- `pnpm test`
- `pnpm test:e2e`
- `pnpm build`

## Architecture

- `src/domain` for pure cycle and reminder logic
- `src/data` for storage defaults, validation, and normalization
- `src/state` for the single React state surface and derived cycle summary hook
- `src/app` for the shell and pathname-based navigation
- `src/features` for screen components and presentation helpers
- `src/styles` for tokens, shared UI styling, and screen-level layout styling

Deeper docs:

- [Architecture](docs/architecture.md)
- [Data model](docs/data-model.md)

## Testing

- `tests/domain` for pure logic
- `tests/data` for storage normalization
- `tests/state` for reducer, selectors, and provider behavior
- `tests/ui` for representative screen behavior
- `tests/e2e` for a thin Playwright smoke layer

`pnpm check` is the main local and CI acceptance command. Playwright smoke tests stay separate and run on `main` plus manual workflow runs.

## Deployment

Tide deploys to Cloudflare Pages as a static site.

1. Create a Pages project named `tide`.
2. Connect the repository in the Cloudflare Pages dashboard.
3. Configure the build command as `pnpm build`.
4. Configure the build output directory as `dist`.
5. Push to `main` to trigger a new Pages deployment.

`pnpm build` generates the deployable static output. `public/_redirects` preserves direct visits to `/history` and `/settings`.
