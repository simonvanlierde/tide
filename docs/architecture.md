# Tide Architecture

Tide stays intentionally small. The app has no backend, no sync layer, and no account system, so the architecture optimizes for a clear local-first boundary rather than flexibility for future subsystems.

## Runtime Boundaries

- `src/domain`
  Pure cycle and reminder logic. No React, storage, or browser APIs.

- `src/data`
  Defaults plus normalization at the `localStorage` boundary.

- `src/state`
  The app-state boundary. Pure reducer/selector logic is kept separate from the React provider and hooks so business rules can be tested without mounting React.

- `src/app`
  The shell and pathname-based route selection for `/`, `/history`, and `/settings`.

- `src/features`
  Screen components and small presentation helpers.

- `src/ui`
  Reusable UI primitives shared across screens.

## Design Principles

- Prefer removing options over adding new configuration surface
- Keep product scope aligned with local-first privacy
- Put validation at the data boundary
- Keep derived cycle logic in pure functions
- Keep React state wiring in one obvious place
- Treat deployment as static hosting on Cloudflare Pages, not part of core app complexity

## Testing Boundaries

- `tests/domain` and `tests/data` protect the pure rules first.
- `tests/state` covers reducer/selector behavior plus provider persistence wiring.
- `tests/ui` covers representative screen behavior rather than every piece of copy.
- `tests/e2e` stays a smoke layer for routing, persistence after reload, and PWA/static-hosting concerns.
