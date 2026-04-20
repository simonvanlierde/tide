# Tide Data Model

Tide persists the current `AppState` JSON shape directly in `localStorage` under `tide.period-tracker.state`.

## App State

```ts
interface AppState {
  periodDays: IsoDate[];
  settings: {
    reminderWindowDays: number;
    snoozedUntil: IsoDate | null;
    homeDisplayMode: "summary" | "linear" | "circular";
  };
}
```

## Normalization Rules

- `periodDays` must be valid ISO dates
- invalid entries are dropped
- duplicates are removed
- dates are sorted ascending
- unsupported settings fall back to defaults
- malformed JSON falls back to the default app state
- removed legacy envelopes such as `{ version, state }` are treated as invalid

## Ownership

- `src/data/schema.ts` owns defaults plus normalization
- `src/data/storage.ts` owns the `localStorage` read/write boundary
- `src/state/core.ts` consumes normalized `AppState` for reducer and selector logic
- `src/state/provider.tsx` owns hydration and persistence wiring for React
