import type { AppState } from "../domain/types";
import { defaultAppState, normalizeAppState, STORAGE_KEY } from "./schema";

// biome-ignore lint/performance/noBarrelFile: intentional re-export of the public storage key
export { STORAGE_KEY } from "./schema";

export const BACKUP_KEY = `${STORAGE_KEY}.backup`;

export function loadAppState(): AppState {
  const raw = window.localStorage.getItem(STORAGE_KEY);

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

export function saveAppState(state: AppState) {
  setItemSafely(STORAGE_KEY, JSON.stringify(state));
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
