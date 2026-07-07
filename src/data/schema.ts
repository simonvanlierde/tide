import { DEFAULT_FLOW, FLOW_INTENSITIES } from "../domain/flow";
import type {
  AppSettings,
  AppState,
  FlowIntensity,
  IsoDate,
  ThemePreference,
} from "../domain/types";

export const STORAGE_KEY = "tide.period-tracker.state";

const THEME_PREFERENCES: ThemePreference[] = ["system", "light", "dark"];

export const defaultAppState: AppState = {
  intensityByDay: {},
  settings: {
    dismissedOn: null,
    showFertility: true,
    showCycleDayNumbers: true,
    theme: "system",
  },
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isIsoDate(value: unknown): value is IsoDate {
  return (
    typeof value === "string" &&
    ISO_DATE_RE.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))
  );
}

export function normalizePeriodDays(periodDays: unknown): IsoDate[] {
  if (!Array.isArray(periodDays)) {
    return [];
  }

  return [...new Set(periodDays.filter(isIsoDate))].sort();
}

const isFlow = (value: unknown): value is FlowIntensity =>
  FLOW_INTENSITIES.includes(value as FlowIntensity);

// Normalize the logged days into the single date -> flow map. Two input shapes:
// current state/backups pass just the map (its keys are the logged days); older
// backups also pass a legacy periodDays list, which is authoritative for *which*
// days are logged — the map only supplies levels, defaulting any missing one.
export function normalizeIntensityByDay(
  intensityByDay: unknown,
  legacyPeriodDays?: unknown,
): Record<IsoDate, FlowIntensity> {
  const levels =
    intensityByDay && typeof intensityByDay === "object"
      ? (intensityByDay as Record<string, unknown>)
      : {};
  const result: Record<IsoDate, FlowIntensity> = {};

  if (Array.isArray(legacyPeriodDays)) {
    for (const day of normalizePeriodDays(legacyPeriodDays)) {
      const level = levels[day];
      result[day] = isFlow(level) ? level : DEFAULT_FLOW;
    }
    return result;
  }

  for (const [day, level] of Object.entries(levels)) {
    if (isIsoDate(day) && isFlow(level)) {
      result[day] = level;
    }
  }

  return result;
}

export function normalizeSettings(settings: unknown): AppSettings {
  const candidate =
    settings && typeof settings === "object"
      ? (settings as Partial<AppSettings>)
      : {};

  return {
    dismissedOn: isIsoDate(candidate.dismissedOn)
      ? candidate.dismissedOn
      : defaultAppState.settings.dismissedOn,
    showFertility:
      typeof candidate.showFertility === "boolean"
        ? candidate.showFertility
        : defaultAppState.settings.showFertility,
    showCycleDayNumbers:
      typeof candidate.showCycleDayNumbers === "boolean"
        ? candidate.showCycleDayNumbers
        : defaultAppState.settings.showCycleDayNumbers,
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
  ) as Partial<AppState> & { days?: unknown; periodDays?: unknown };

  // Backups use `days`; current state uses `intensityByDay`; legacy state also
  // carries a `periodDays` list, which migrates on import (see normalizeIntensityByDay).
  return {
    intensityByDay: normalizeIntensityByDay(
      candidate.days ?? candidate.intensityByDay,
      candidate.periodDays,
    ),
    settings: normalizeSettings(candidate.settings),
  };
}
