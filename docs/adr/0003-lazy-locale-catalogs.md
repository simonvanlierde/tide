# 3. Lazy locale catalogs

- Status: accepted
- Date: 2026-11-15
- Supersedes: the bundling and fetching parts of [ADR 0002](0002-lingui-catalogs.md)

## Context

ADR 0002 bundled all five catalogs in the main chunk, and rejected "fetch one catalog at a
time" because of an offline failure path. A build of that decision had a main chunk of
113,151 bytes gzipped, of which the five catalogs were about 21,000. Every visitor paid
for four languages they did not use.

## Decision

Each catalog is its own chunk, loaded with `import()` through `loadCatalog` in `src/i18n`.
This is not a runtime fetch from a server: Vite emits the chunks, and the service worker
precaches all five at install, so a language change offline reads from the cache.

- `main.tsx` loads the saved language (or the system default) before the first render.
- `AppStateProvider` loads a newly chosen language and keeps showing the old one until
  the catalog is there. It renders nothing while no catalog is loaded, so no screen shows
  message keys.
- English is lazy too. Eager English would keep 3.7 kB gzipped in the main chunk for every
  other language, and saves English users one request that the service worker answers
  after the first visit.
- Nothing new is stored: the language preference keeps its existing key and format.

## Consequences

Measured on the same build: main chunk 113,151 to 96,637 bytes gzipped, so the 25%
headroom rule holds again with a 118 KiB limit. First load in one language is the main chunk
plus 3.7 to 4.5 kB. The precache grows from 200,548 to 204,921 bytes gzipped (14 to 19 files),
and `scripts/checkBundleBudget.mjs` now limits it at 251 KiB.

Code that reads text outside the provider, including the tests, must call `loadCatalog`
first: `translate` and the translators have no messages until then. A new language needs
its loader in `src/i18n`.

`main.tsx` has no top-level await. With one, the bundler split the shared state and
schema modules out of the entry chunk into four more files, which cost about 3 kB gzipped
and four more requests on first load.
