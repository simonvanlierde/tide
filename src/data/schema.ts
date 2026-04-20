import type { AppSettings, AppState, HomeDisplayMode, IsoDate } from "../domain/types";

export const STORAGE_KEY = "tide.period-tracker.state";

export const HOME_DISPLAY_MODES: HomeDisplayMode[] = [
  "summary",
  "linear",
  "circular",
];

export const defaultAppState: AppState = {
  periodDays: [],
  settings: {
    reminderWindowDays: 4,
    snoozedUntil: null,
    homeDisplayMode: "summary",
  },
};

function isIsoDate(value: unknown): value is IsoDate {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))
  );
}

export function normalizePeriodDays(periodDays: unknown): IsoDate[] {
  if (!Array.isArray(periodDays)) {
    return defaultAppState.periodDays;
  }

  return [...new Set(periodDays.filter(isIsoDate))].sort();
}

export function normalizeSettings(settings: unknown): AppSettings {
  const candidate =
    settings && typeof settings === "object"
      ? (settings as Partial<AppSettings>)
      : {};

  return {
    reminderWindowDays:
      typeof candidate.reminderWindowDays === "number" &&
      Number.isFinite(candidate.reminderWindowDays)
        ? candidate.reminderWindowDays
        : defaultAppState.settings.reminderWindowDays,
    snoozedUntil: isIsoDate(candidate.snoozedUntil)
      ? candidate.snoozedUntil
      : defaultAppState.settings.snoozedUntil,
    homeDisplayMode: HOME_DISPLAY_MODES.includes(
      candidate.homeDisplayMode as HomeDisplayMode,
    )
      ? (candidate.homeDisplayMode as HomeDisplayMode)
      : defaultAppState.settings.homeDisplayMode,
  };
}

export function normalizeAppState(state: unknown): AppState {
  if (!state || typeof state !== "object" || "version" in state || "state" in state) {
    return defaultAppState;
  }

  const candidate = state as Partial<AppState>;

  return {
    periodDays: normalizePeriodDays(candidate.periodDays),
    settings: normalizeSettings(candidate.settings),
  };
}
