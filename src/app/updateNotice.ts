import { useSyncExternalStore } from "react";

// Held in memory only: a waiting worker is rediscovered on every launch, so nothing is stored.
let applyUpdate: (() => void) | null = null;
const listeners = new Set<() => void>();

/** Records the action that activates the waiting version, or clears it with null. */
export function setUpdateAction(action: (() => void) | null) {
  applyUpdate = action;
  for (const listener of listeners) listener();
}

export function useUpdateAction() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => applyUpdate,
  );
}

const HOUR_MS = 60 * 60 * 1000;

/**
 * An installed phone app is resumed, not navigated, so the browser's own check on page load
 * never runs. Ask for one when the page becomes visible, at most once an hour.
 */
export function checkForUpdatesOnResume(
  registration: ServiceWorkerRegistration,
  doc: Document = document,
  now: () => number = Date.now,
) {
  let lastCheck = now(); // registering already checked
  doc.addEventListener("visibilitychange", () => {
    if (doc.visibilityState !== "visible" || now() - lastCheck < HOUR_MS) return;
    lastCheck = now();
    // Offline or a failed fetch: the next resume tries again.
    registration.update().catch(() => undefined);
  });
}
