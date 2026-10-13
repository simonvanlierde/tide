import type { AppState } from "../domain/types";
import {
  defaultAppState,
  normalizeAppState,
  SCHEMA_VERSION,
  STORAGE_KEY,
  storedSchemaVersion,
} from "./schema";

// biome-ignore lint/performance/noBarrelFile: intentional re-export of the public storage key
export { STORAGE_KEY } from "./schema";

export const BACKUP_KEY = `${STORAGE_KEY}.backup`;

export interface StoredState {
  state: AppState;
  /** Written by a newer build: show it, but never save over it. */
  readOnly: boolean;
}

export function loadStoredState(): StoredState {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage blocked (site data disabled): run with defaults, nothing to back up.
    return { state: defaultAppState, readOnly: false };
  }

  if (!raw) {
    return { state: defaultAppState, readOnly: false };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Keep the unreadable blob so the next save can't permanently destroy it.
    setItemSafely(BACKUP_KEY, raw);
    return { state: defaultAppState, readOnly: false };
  }

  const state = normalizeAppState(parsed);
  if (storedSchemaVersion(parsed) > SCHEMA_VERSION) {
    return { state, readOnly: true };
  }
  // The next save writes the normalized state, so keep the original whenever
  // that would differ from it: a dropped day, an unknown field, a bad value.
  // Our own saves round-trip unchanged, so this only fires on blobs written
  // elsewhere or by an older build.
  if (serialize(state) !== raw) {
    setItemSafely(BACKUP_KEY, raw);
  }
  return { state, readOnly: false };
}

export function loadAppState(): AppState {
  return loadStoredState().state;
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
  setItemSafely(STORAGE_KEY, serialize(state));
}

function serialize(state: AppState) {
  return JSON.stringify({ schemaVersion: SCHEMA_VERSION, ...state });
}

// Remove every copy of the user's data, including the pre-normalization backup,
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
