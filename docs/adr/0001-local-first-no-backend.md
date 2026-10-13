# 1. Local-first, no backend

- Status: accepted
- Date: 2026-07-06

## Context

Tide tracks menstrual cycles. That is among the most sensitive data a person can
record, and in several jurisdictions it is a legal liability for whoever holds it.
The usual setup (accounts, a server, a database) puts that data in someone else's
hands. There it can be subpoenaed or breached, and running that server is a job
a solo project cannot credibly staff. The pull the other way: a backend is what normally
provides sync, cloud backup, and multi-user features.

## Decision

We keep all cycle data on the user's device in `localStorage`. No accounts, no
network requests, no analytics. Tide ships as an installable PWA that works
offline, so the "app" is just static files on a CDN, with no state on a server.

The code is split into layers that keep this honest. The pure cycle logic in
`src/domain` depends on nothing. `src/data` is the only place that touches
`localStorage`, and it validates and normalizes the saved state there. Nothing
reaches for the network.

## Consequences

**Good**:

- The privacy claim comes from how Tide is built, not from a policy promise.
  There is no server to subpoena, breach, or bill for.
- Tide works fully offline, and hosting is a static bucket.
- The pure `domain` layer is easy to test as plain functions.

**Costs / limits, accepted:**

- No sync across devices and no cloud backup. If the user clears browser storage
  or loses the device, the data is gone. The planned fix is an explicit export and
  import (a local file the user controls), not a backend.
  Update 2026-10-13: export and import shipped; see the README.
- No multi-user or sharing features.
- Predictions run only on data that fits in local storage. That is plenty for
  a period tracker.

## Alternatives considered

- **Backend with accounts**: rejected. It brings back the exact liability of
  holding people's data that this project exists to avoid.
- **End-to-end-encrypted cloud sync**: deferred. It would restore sync without
  data the server can read. But the screens and steps it needs for managing keys
  and recovering lost ones aren't justified for a single-device tracker today.
