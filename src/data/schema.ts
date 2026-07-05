import type {
  AppSettings,
  AppState,
  IsoDate,
  ThemePreference,
} from "../domain/types";

export const STORAGE_KEY = "tide.period-tracker.state";

const THEME_PREFERENCES: ThemePreference[] = ["system", "light", "dark"];

export const defaultAppState: AppState = {
  periodDays: [],
  settings: {
    dismissedFor: null,
    showFertility: true,
    theme: "system",
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
    dismissedFor: isIsoDate(candidate.dismissedFor)
      ? candidate.dismissedFor
      : defaultAppState.settings.dismissedFor,
    showFertility:
      typeof candidate.showFertility === "boolean"
        ? candidate.showFertility
        : defaultAppState.settings.showFertility,
    theme: THEME_PREFERENCES.includes(candidate.theme as ThemePreference)
      ? (candidate.theme as ThemePreference)
      : defaultAppState.settings.theme,
  };
}

export function normalizeAppState(state: unknown): AppState {
  if (!state || typeof state !== "object") {
    return defaultAppState;
  }

  // Pre-release builds persisted a { version, state } envelope; unwrap it so
  // upgrading users keep their logged history.
  const candidate = (
    "state" in state && state.state && typeof state.state === "object"
      ? state.state
      : state
  ) as Partial<AppState>;

  return {
    periodDays: normalizePeriodDays(candidate.periodDays),
    settings: normalizeSettings(candidate.settings),
  };
}
