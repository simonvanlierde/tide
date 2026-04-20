# Tide Architecture

Tide is organized around a few small runtime boundaries:

- `src/domain`
  Pure cycle and reminder logic. No React, storage, or browser APIs.

- `src/data`
  Defaults plus normalization at the `localStorage` boundary.

- `src/state`
  The single app-state surface: reducer, provider, actions, and derived cycle summary hook.

- `src/app`
  The app shell and pathname-based route selection for `/`, `/history`, and `/settings`.

- `src/features`
  Screen components and focused presentation helpers.

- `src/ui`
  Reusable UI primitives shared across screens.

Design principles:

- Prefer removing options over adding new configuration surface
- Keep product scope aligned with local-first privacy
- Put validation at the data boundary
- Keep derived cycle logic in pure functions
- Keep React state wiring in one obvious place
- Treat deployment as static hosting on Cloudflare Pages, not part of core app complexity
