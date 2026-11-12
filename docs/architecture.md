# Architecture

Tide is a static React app with no backend. Vite builds it to `dist/`, and everything a user logs
stays in the browser's `localStorage`. [ADR 0001](adr/0001-local-first-no-backend.md) records why.

## Layers

I keep the cycle logic pure and away from React and the browser, so it can be tested as plain
functions. Dependencies point inward:

```mermaid
flowchart TD
  main["src/main.tsx"] --> app & state
  app["src/app<br/>shell, routing, legal pages"] --> features & state
  features["src/features/*<br/>today, calendar, log, settings, reminders"] --> state & domain & ui & utils
  features -- "backup, import, calendar file" --> data
  state["src/state<br/>reducer, provider, selectors"] --> domain & data
  data["src/data<br/>storage, schema, transfer"] --> domain
  domain["src/domain<br/>cycle, flow, reminders, types"] --> utils["src/utils<br/>dates"]
  i18n["src/i18n<br/>one dictionary per locale"]
  ui["src/ui<br/>icons"]
  state & features & domain & data --> i18n
```

- `src/domain`: pure cycle and reminder logic, with no React, storage or browser APIs.
- `src/data`: the only code that reads and writes `localStorage`, plus the backup, import and
  calendar files.
- `src/state`: the reducer and selectors in `core.ts`, and the React provider that holds the state.
- `src/app`: the app shell and routing by pathname (`/`, `/calendar`, `/settings` and the legal pages).
- `src/features`: one folder per screen or flow.
- `src/i18n`: typed message dictionaries, one per locale.
- `src/ui`, `src/styles` and `src/utils`: shared icons, styles and date helpers.

## Data flow

1. On start, `AppStateProvider` (`src/state/provider.tsx`) loads the saved state through
   `loadStoredState` in `src/data/storage.ts`. `normalizeAppState` in `src/data/schema.ts` checks
   every field and fills defaults. A blob it had to change is kept under a backup key first.
2. Screens dispatch actions to `appStateReducer` in `src/state/core.ts`. Each change is saved back
   to `localStorage`. A state written by a newer build is shown read-only and never saved over.
3. `selectForecast` passes the logged days to `forecast` in `src/domain/cycle.ts`, which works out
   the next period and, if the user turned it on, the fertile window.
   [How predictions work](predictions.md) has the rules and numbers.
4. Settings → Data uses `src/data/transfer.ts` to save a JSON backup and to read one back, and
   `src/data/otherApps.ts` to read Clue and Flo exports. A Tide backup replaces the state, and
   includes daily symptoms, mood and notes. Bleeding days from another app are merged under
   the ones already logged; these imports leave daily details unchanged.
5. A `storage` event from another tab or the installed app replaces the state with that window's
   saved copy. Simultaneous edits are not merged; the last save wins.

Daily details are separate from bleeding logs. The forecast uses bleeding history only;
symptoms, mood and notes do not change estimates. An empty symptom list means the user
recorded no symptoms; a null value means symptoms were not recorded.

## First-use guidance

Schema 5 adds `onboardingDismissed` and `calendarHelpDismissed` to the existing local
settings. A fresh installation starts both as false. Normalizing an existing saved state
without valid flags treats both as dismissed, so an upgrade does not introduce a tour.
The schema bump makes an older tab read the newer blob as read-only.

The first-use card is inline on Today. It temporarily replaces the empty dial, so the
log button stays above the tabs on a short phone. Dismissal or the first successful new
bleeding log, daily detail or import completes the introduction. Its optional fertility
disclosure changes only `showFertility`; skipping it leaves estimates off.

The Calendar hint teaches bleeding-day and range logging. It disappears after either
action adds a day there; diary entries, invalid selections and cancelled ranges leave it
available. Undo does not restore either hint. The existing settings action saves these
flags in the same storage blob; another tab adopts them with the rest of the state.

Both flags are device-local and omitted from backups. An import preserves the local
Calendar flag and completes Today’s introduction. Delete all data resets both flags along
with the other settings. No storage key or request is added.

## Offline and hosting

`vite-plugin-pwa` (in `vite.config.ts`) writes the web app manifest and a service worker that
precaches the build, so the app works offline and updates itself on the next visit.
The legal pages in `docs/` are Markdown, turned into HTML at build time by the `markdown` plugin
in the same file.

Cloudflare hosts `dist/` with the headers in `public/_headers`. The README
[Deploy section](../README.md#deploy) describes the Worker deployment and pending custom-domain migration.
The Content-Security-Policy limits app requests to this origin. Cloudflare can also instruct the browser
to send network error reports, as the [privacy statement](privacy.md#what-our-host-sees) explains.

## Tests

Vitest tests in `tests/` follow the same layers, one folder each, with component tests for the
screens in `tests/ui`. On top sits a thin layer of Playwright tests in `tests/e2e`
against the production build: routing, data that survives a reload, accessibility, the CSP and a
smoke test of the PWA.
