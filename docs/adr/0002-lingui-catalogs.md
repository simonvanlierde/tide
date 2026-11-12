# 2. Lingui catalogs

- Status: accepted
- Date: 2026-11-12

## Context

Five TypeScript dictionaries and a separate forecast dictionary hold Tide's translations.
Plural messages use paired IDs and a custom selector. Translators need PO catalogs that
catalog tools can read, while Tide must keep every translation available offline.

## Decision

Use Lingui 6 for React with manually maintained PO catalogs and explicit IDs.
Keep ordinary IDs; map each `id.one` and `id.other` pair to one ICU plural at `id`.
Compile with `lingui compile --strict` before builds and tests. Bundle all five main
catalogs together, and keep forecast catalogs with the existing lazy forecast chunk.
The service worker precaches both. Do not fetch catalogs or save another language key.

## Consequences

PO catalogs replace TypeScript key parity. Strict compilation rejects missing translations;
tests cover the language picker and locale resolution. A migration comparison script
checks the exact rendered text of every old key and plural form against the original commit.
Dates still use `Intl`, and the stored language preference keeps its existing format.

Generated catalogs stay out of Git. Contributors compile again after editing a PO file.
Automatic extraction is not used because Tide selects some IDs dynamically.

## Alternatives considered

- Keep the dictionaries: preserves key typing but cannot use PO catalog tools directly.
- Fetch one catalog at a time: saves initial bytes but adds a failure path when offline.
