# AGENTS.md

Notes for coding agents working on tide. The `justfile` holds every command;
`just` lists them.

## Check

Run `just check` before you call a change done. It runs what CI runs for each stack.
`just fmt` fixes what it can first.

## Test

- TypeScript: `just ts-test`. Extra arguments reach the test runner.

## Docs

`README.md` says how to set up, run and release the project. Record user-facing changes
under `[Unreleased]` in `CHANGELOG.md`.
`CONTRIBUTING.md` has the commit rules.
