# Tide Data Model

## In-Memory App State

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

## Persisted Storage Shape

Tide stores a versioned record in `localStorage`:

```ts
interface PersistedAppStateV1 {
  version: 1;
  state: AppState;
}
```

## Backup Shape

Backups intentionally use the same versioned shape as local storage:

```ts
interface BackupPayloadV1 {
  version: 1;
  state: AppState;
}
```

## Normalization Rules

- `periodDays` must be valid ISO dates
- invalid entries are dropped
- duplicates are removed
- dates are sorted ascending
- unsupported settings fall back to defaults
- legacy unversioned payloads are still accepted and normalized during load/import
