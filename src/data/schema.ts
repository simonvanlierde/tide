import { FLOW_INTENSITIES } from "../domain/flow";
import type {
  AppSettings,
  AppState,
  FlowIntensity,
  IsoDate,
  LanguagePreference,
  ThemePreference,
} from "../domain/types";
import { SUPPORTED_LANGUAGES } from "../i18n";

export const STORAGE_KEY = "tide.period-tracker.state";

const THEME_PREFERENCES: ThemePreference[] = ["system", "light", "dark"];
const LANGUAGE_PREFERENCES: LanguagePreference[] = [
  "system",
  ...SUPPORTED_LANGUAGES,
];

export const defaultAppState: AppState = {
  intensityByDay: {},
  settings: {
    dismissedOn: null,
    showFertility: true,
    showCycleDayNumbers: true,
    theme: "system",
    language: "system",
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

const isFlow = (value: unknown): value is FlowIntensity =>
  FLOW_INTENSITIES.includes(value as FlowIntensity);

// Normalize the logged days into the single date -> flow map. Its keys are the
// logged days and its values their flow levels; any invalid entry is dropped.
export function normalizeIntensityByDay(
  intensityByDay: unknown,
): Record<IsoDate, FlowIntensity> {
  const levels =
    intensityByDay && typeof intensityByDay === "object"
      ? (intensityByDay as Record<string, unknown>)
      : {};
  const result: Record<IsoDate, FlowIntensity> = {};

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
    language: LANGUAGE_PREFERENCES.includes(
      candidate.language as LanguagePreference,
    )
      ? (candidate.language as LanguagePreference)
      : defaultAppState.settings.language,
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
  ) as Partial<AppState> & { days?: unknown };

  // Backups use `days`; current state uses `intensityByDay`.
  return {
    intensityByDay: normalizeIntensityByDay(
      candidate.days ?? candidate.intensityByDay,
    ),
    settings: normalizeSettings(candidate.settings),
  };
}
