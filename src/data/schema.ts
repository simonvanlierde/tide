import { FLOW_INTENSITIES } from "../domain/flow";
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
  periodDays: [],
  intensityByDay: {},
  settings: {
    dismissedFor: null,
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
    return defaultAppState.periodDays;
  }

  return [...new Set(periodDays.filter(isIsoDate))].sort();
}

// Keep only valid intensity entries whose day is actually logged, so the map
// can never disagree with periodDays about which days exist.
export function normalizeIntensityByDay(
  intensityByDay: unknown,
  periodDays: IsoDate[],
): Record<IsoDate, FlowIntensity> {
  if (!intensityByDay || typeof intensityByDay !== "object") {
    return {};
  }

  const loggedDays = new Set(periodDays);
  const result: Record<IsoDate, FlowIntensity> = {};

  for (const [day, level] of Object.entries(intensityByDay)) {
    if (
      isIsoDate(day) &&
      loggedDays.has(day) &&
      FLOW_INTENSITIES.includes(level as FlowIntensity)
    ) {
      result[day] = level as FlowIntensity;
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
    dismissedFor: isIsoDate(candidate.dismissedFor)
      ? candidate.dismissedFor
      : defaultAppState.settings.dismissedFor,
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
  ) as Partial<AppState>;

  const periodDays = normalizePeriodDays(candidate.periodDays);

  return {
    periodDays,
    intensityByDay: normalizeIntensityByDay(
      candidate.intensityByDay,
      periodDays,
    ),
    settings: normalizeSettings(candidate.settings),
  };
}
