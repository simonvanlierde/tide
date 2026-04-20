# Tide Architecture

Tide is deliberately small and local-first. The app is organized so each layer has one job:

- `src/domain`
  Pure logic for cycle calculations and reminder timing. No React, storage, or DOM access.

- `src/data`
  Runtime normalization for persisted state, versioned storage records, and backup import/export.

- `src/state`
  The reducer, provider, and app-state hook. This layer connects React to the domain and data layers.

- `src/features`
  Screen-level components and small presentation-specific helpers for Today, History, Settings, reminders, and logging flows.

- `src/ui`
  Shared UI helpers and icons that are reused across screens.

Design principles:

- Prefer removing options over adding new configuration surface
- Keep product scope aligned with local-first privacy
- Put validation at the data boundary
- Keep derived cycle logic in pure functions
- Treat deployment as optional infrastructure, not part of core app complexity
