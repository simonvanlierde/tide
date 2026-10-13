import type { AppState } from "../domain/types";
import { defaultAppState, normalizeAppState, STORAGE_KEY } from "./schema";

// biome-ignore lint/performance/noBarrelFile: intentional re-export of the public storage key
export { STORAGE_KEY } from "./schema";

export const BACKUP_KEY = `${STORAGE_KEY}.backup`;

export function loadAppState(): AppState {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage blocked (site data disabled): run with defaults, nothing to back up.
    return defaultAppState;
  }

  if (!raw) {
    return defaultAppState;
  }

  try {
    return normalizeAppState(JSON.parse(raw));
  } catch {
    // Keep the unreadable blob so the next save can't permanently destroy it.
    setItemSafely(BACKUP_KEY, raw);
    return defaultAppState;
  }
}

// The stored blob exactly as saved, or null when there is none or storage is
// blocked. For the crash screen, which must not depend on parsing it.
export function loadRawAppState(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveAppState(state: AppState) {
  setItemSafely(STORAGE_KEY, JSON.stringify(state));
}

// Remove every copy of the user's data, including the corrupt-blob backup,
// which nothing else ever surfaces.
export function clearAppState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(BACKUP_KEY);
  } catch {
    // Storage blocked: nothing was ever written, so there is nothing to clear.
  }
}

// Storage can be full or blocked (e.g. private browsing); losing persistence
// must not crash the app.
function setItemSafely(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    // Don't crash, but surface it: a swallowed failure here is silent data loss.
    // biome-ignore lint/suspicious/noConsole: last-resort diagnostic for lost persistence
    console.warn(`tide: could not persist "${key}" to localStorage`, error);
  }
}
