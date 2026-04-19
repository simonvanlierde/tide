import type { AppSettings, AppState, HomeLayoutMode } from "../domain/types";

const STORAGE_KEY = "tide.period-tracker.state";

export const defaultAppState: AppState = {
  periodDays: [],
  settings: {
    reminderWindowDays: 4,
    snoozedUntil: null,
    homeLayoutMode: "circular",
    showPhaseChip: true,
    showFertilityChip: true
  }
};

const HOME_LAYOUT_MODES: HomeLayoutMode[] = ["simple", "linear", "circular"];

export function normalizeSettings(settings: unknown): AppSettings {
  const candidate = settings && typeof settings === "object" ? (settings as Partial<AppSettings>) : {};

  return {
    reminderWindowDays:
      typeof candidate.reminderWindowDays === "number"
        ? candidate.reminderWindowDays
        : defaultAppState.settings.reminderWindowDays,
    snoozedUntil:
      typeof candidate.snoozedUntil === "string" || candidate.snoozedUntil === null
        ? candidate.snoozedUntil
        : defaultAppState.settings.snoozedUntil,
    homeLayoutMode: HOME_LAYOUT_MODES.includes(candidate.homeLayoutMode as HomeLayoutMode)
      ? (candidate.homeLayoutMode as HomeLayoutMode)
      : defaultAppState.settings.homeLayoutMode,
    showPhaseChip:
      typeof candidate.showPhaseChip === "boolean"
        ? candidate.showPhaseChip
        : defaultAppState.settings.showPhaseChip,
    showFertilityChip:
      typeof candidate.showFertilityChip === "boolean"
        ? candidate.showFertilityChip
        : defaultAppState.settings.showFertilityChip
  };
}

export function loadAppState(): AppState {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return defaultAppState;
  }

  const parsed = JSON.parse(raw) as Partial<AppState>;

  return {
    periodDays: Array.isArray(parsed.periodDays) ? parsed.periodDays : defaultAppState.periodDays,
    settings: normalizeSettings(parsed.settings)
  };
}

export function saveAppState(state: AppState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
