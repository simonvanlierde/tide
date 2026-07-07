# TODOs

## Backward-compat shims to remove someday

These exist only to keep upgrading users' locally-stored / exported state working.
Once we're confident no old state remains in the wild, delete them.

- **`src/data/schema.ts`: `normalizeSettings` legacy key.** Reads
  `showPeriodDayNumbers` (→ `showCycleDayNumbers`) when the new key is absent.
  Marked `TODO(remove-legacy-settings)`.
- **`src/data/schema.ts`: `normalizeIntensityByDay` legacy `periodDays`.** Older
  backups stored a separate `periodDays` list (authoritative for which days were
  logged) alongside/instead of the flow map. The `Array.isArray(legacyPeriodDays)`
  branch migrates it. Drop the branch (and the `legacyPeriodDays` param threaded
  from `normalizeAppState`) once legacy backups no longer matter.
