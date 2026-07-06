# 1. Local-first, no backend

- Status: accepted
- Date: 2026-07-06

## Context

Tide tracks menstrual cycles — among the most sensitive personal data a person
can record. In several jurisdictions this data has become a legal liability for
whoever holds it. The usual app architecture (accounts, a server, a database)
means someone other than the user holds that data and can be compelled to
produce it, and it adds a breach surface, hosting cost, and ongoing operational
duty that a solo project cannot credibly staff.

The counter-pull is that a backend is what normally provides cross-device sync,
cloud backup, and multi-user features.

## Decision

Keep all cycle data on the user's device in `localStorage`. No accounts, no
network requests, no analytics. Ship as an installable, offline-capable PWA so
the "app" is just static files on a CDN with no server-side state.

The codebase is layered to keep this honest: pure cycle logic in `src/domain`
depends on nothing, and `src/data` is the single `localStorage` boundary where
persisted state is validated and normalized. Nothing reaches for the network.

## Consequences

Good:

- The privacy claim is structural, not a policy promise — there is no server to
  subpoena, breach, or bill for.
- Works fully offline; hosting is a static bucket.
- The pure `domain` layer is trivially testable as plain functions.

Costs / limits, accepted:

- No sync across devices and no cloud backup. Clearing browser storage or
  losing the device loses the data. A future explicit export/import (a local
  file the user controls) is the intended mitigation, not a backend.
- No multi-user or sharing features.
- Predictions run only on data that fits in local storage, which is ample for
  this use case.

## Alternatives considered

- **Backend with accounts** — rejected: reintroduces exactly the data-custody
  liability this project exists to avoid.
- **End-to-end-encrypted cloud sync** — deferred: it would restore sync without
  readable server-side data, but the key-management and recovery UX is a large
  amount of work that is not justified for a single-device tracker today.
