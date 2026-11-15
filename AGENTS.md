# AGENTS.md

Notes for coding agents working on tide. The `justfile` holds every command;
`just` lists them.

## Check

Run `just check` and `just ts-e2e` before you call a change done. `just check` covers lint, types,
unit tests, build, bundle budget and audit. CI also runs the e2e tests (accessibility, CSP, reflow,
PWA) and the git hooks (`just hooks`). `just fmt` fixes what it can first.

## Test

- TypeScript: `just ts-test`. Extra arguments reach the test runner.

## Docs

`README.md` says what the app does and how to set it up. `docs/development.md` has the
other commands, translations and deploys. Record user-facing changes
under `[Unreleased]` in `CHANGELOG.md`.
Read `docs/adr/` before changing a recorded choice.
`.github/CONTRIBUTING.md` has the commit and sign-off rules.
The legal pages the web app serves are in `docs/`.
`PRODUCT.md` and `DESIGN.md` beside them say who the app is for and how it looks.
