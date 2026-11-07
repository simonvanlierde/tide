import { getCycleHistory } from "../domain/cycle";
import { FLOW_INTENSITIES, getPredictionDays } from "../domain/flow";
import type {
  AppSettings,
  AppState,
  FlowIntensity,
  IsoDate,
  LanguagePreference,
  LoggedFlow,
  ThemePreference,
} from "../domain/types";
import { SUPPORTED_LANGUAGES } from "../i18n";

export const STORAGE_KEY = "tide.period-tracker.state";

// The stored shape this build reads and writes. Bump it when a change would
// lose data in an older build that rewrites the blob with only the fields it
// knows. Blobs from before versioning have no schemaVersion and read as 0.
// 2: showFertility can be null (not asked yet); see normalizeAppState.
// 3: incomplete cycle markers and local backup dates.
export const SCHEMA_VERSION = 3;

const THEME_PREFERENCES: ThemePreference[] = ["system", "light", "dark"];
const LANGUAGE_PREFERENCES: LanguagePreference[] = ["system", ...SUPPORTED_LANGUAGES];

export const defaultAppState: AppState = {
  intensityByDay: {},
  incompleteCycleStarts: [],
  settings: {
    dismissedOn: null,
    lastBackupOn: null,
    backupReminderDismissedOn: null,
    showFertility: null,
    showCycleDayNumbers: true,
    theme: "system",
    language: "system",
    calendarId: null,
  },
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// crypto.randomUUID's shape. It goes into calendar-file lines as is, so a
// backup can't put anything else there.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function isIsoDate(value: unknown): value is IsoDate {
  if (typeof value !== "string" || !ISO_DATE_RE.test(value)) {
    return false;
  }
  // Round-trip so an overflowing day ("2023-02-29") is rejected rather than
  // rolled over by Date.parse into a date that never matches its own key.
  const time = Date.parse(`${value}T00:00:00.000Z`);
  return !Number.isNaN(time) && new Date(time).toISOString().startsWith(value);
}

const isFlow = (value: unknown): value is FlowIntensity => FLOW_INTENSITIES.includes(value as FlowIntensity);

// null is a logged day with no chosen level; any other non-flow value is junk.
const isLoggedFlow = (value: unknown): value is LoggedFlow => value === null || isFlow(value);

// Normalize the logged days into the single date -> flow map. Its keys are the
// logged days and its values their flow levels; any invalid entry is dropped.
export function normalizeIntensityByDay(intensityByDay: unknown): Record<IsoDate, LoggedFlow> {
  const levels =
    intensityByDay && typeof intensityByDay === "object" ? (intensityByDay as Record<string, unknown>) : {};
  const result: Record<IsoDate, LoggedFlow> = {};

  for (const [day, level] of Object.entries(levels)) {
    if (isIsoDate(day) && isLoggedFlow(level)) {
      result[day] = level;
    }
  }

  return result;
}

export function normalizeSettings(settings: unknown): AppSettings {
  const candidate = settings && typeof settings === "object" ? (settings as Partial<AppSettings>) : {};

  return {
    dismissedOn: isIsoDate(candidate.dismissedOn) ? candidate.dismissedOn : defaultAppState.settings.dismissedOn,
    lastBackupOn: isIsoDate(candidate.lastBackupOn) ? candidate.lastBackupOn : null,
    backupReminderDismissedOn: isIsoDate(candidate.backupReminderDismissedOn)
      ? candidate.backupReminderDismissedOn
      : null,
    showFertility:
      typeof candidate.showFertility === "boolean" ? candidate.showFertility : defaultAppState.settings.showFertility,
    showCycleDayNumbers:
      typeof candidate.showCycleDayNumbers === "boolean"
        ? candidate.showCycleDayNumbers
        : defaultAppState.settings.showCycleDayNumbers,
    theme: THEME_PREFERENCES.includes(candidate.theme as ThemePreference)
      ? (candidate.theme as ThemePreference)
      : defaultAppState.settings.theme,
    language: LANGUAGE_PREFERENCES.includes(candidate.language as LanguagePreference)
      ? (candidate.language as LanguagePreference)
      : defaultAppState.settings.language,
    calendarId:
      typeof candidate.calendarId === "string" && UUID_RE.test(candidate.calendarId)
        ? candidate.calendarId
        : defaultAppState.settings.calendarId,
  };
}

export function normalizeAppState(state: unknown): AppState {
  if (!state || typeof state !== "object") {
    return defaultAppState;
  }
  const version = "schemaVersion" in state && typeof state.schemaVersion === "number" ? state.schemaVersion : 0;

  // Pre-release builds persisted a { version, state } envelope; unwrap it so
  // upgrading users keep their logged history.
  const candidate = (
    "state" in state && state.state && typeof state.state === "object" ? state.state : state
  ) as Partial<AppState> & { days?: unknown };

  const settings = normalizeSettings(candidate.settings);
  // Before version 2, showFertility defaulted to true without anyone being
  // asked. Turn that default back into "not asked" so the question shows; a
  // false was a choice made in Settings and stays.
  if (version < 2 && settings.showFertility) {
    settings.showFertility = null;
  }

  // Backups use `days`; current state uses `intensityByDay`.
  const rawDays = candidate.days ?? candidate.intensityByDay;
  const intensityByDay = normalizeIntensityByDay(rawDays);
  // Dropped logs may have been interval boundaries; their markers cannot safely survive.
  const logsUnchanged =
    rawDays && typeof rawDays === "object" && Object.keys(rawDays).length === Object.keys(intensityByDay).length;
  const markers =
    logsUnchanged && Array.isArray(candidate.incompleteCycleStarts)
      ? candidate.incompleteCycleStarts.filter(isIsoDate)
      : [];
  return {
    intensityByDay,
    incompleteCycleStarts: getCycleHistory(getPredictionDays(intensityByDay), markers)
      .filter((cycle) => cycle.incomplete)
      .map((cycle) => cycle.start),
    settings,
  };
}

// A marker belongs to an interval, not just a date. Changed boundaries need a new choice.
export function updateLoggedDays(state: AppState, intensityByDay: AppState["intensityByDay"]): AppState {
  const previous = getCycleHistory(getPredictionDays(state.intensityByDay), state.incompleteCycleStarts);
  const next = new Map(getCycleHistory(getPredictionDays(intensityByDay)).map((cycle) => [cycle.start, cycle.end]));
  return {
    ...state,
    intensityByDay,
    incompleteCycleStarts: previous
      .filter((cycle) => cycle.incomplete && next.get(cycle.start) === cycle.end)
      .map((cycle) => cycle.start),
  };
}
