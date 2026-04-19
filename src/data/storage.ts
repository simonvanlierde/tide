import type { AppState } from "../domain/types";

const STORAGE_KEY = "tide.period-tracker.state";

export const defaultAppState: AppState = {
  periodDays: [],
  settings: {
    reminderWindowDays: 4,
    snoozedUntil: null
  }
};

export function loadAppState(): AppState {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return defaultAppState;
  }

  return JSON.parse(raw) as AppState;
}

export function saveAppState(state: AppState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
