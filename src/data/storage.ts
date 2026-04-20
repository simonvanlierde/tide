import type { AppState } from "../domain/types";
import {
  defaultAppState,
  normalizePersistedState,
  STORAGE_KEY,
  toPersistedAppState,
} from "./schema";

export { defaultAppState, STORAGE_KEY } from "./schema";

export function loadAppState(): AppState {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return defaultAppState;
  }

  try {
    return normalizePersistedState(JSON.parse(raw));
  } catch {
    return defaultAppState;
  }
}

export function saveAppState(state: AppState) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(toPersistedAppState(state)),
  );
}
