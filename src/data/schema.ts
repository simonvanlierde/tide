import type {
  AppSettings,
  AppState,
  BackupPayloadV1,
  HomeDisplayMode,
  IsoDate,
  PersistedAppStateV1,
} from "../domain/types";

export const STORAGE_KEY = "tide.period-tracker.state";
export const PERSISTED_STATE_VERSION = 1;

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
  const candidate =
    state && typeof state === "object" ? (state as Partial<AppState>) : {};

  return {
    periodDays: normalizePeriodDays(candidate.periodDays),
    settings: normalizeSettings(candidate.settings),
  };
}

export function toPersistedAppState(state: AppState): PersistedAppStateV1 {
  return {
    version: PERSISTED_STATE_VERSION,
    state,
  };
}

export function toBackupPayload(state: AppState): BackupPayloadV1 {
  return {
    version: PERSISTED_STATE_VERSION,
    state,
  };
}

export function normalizePersistedState(payload: unknown): AppState {
  const candidate =
    payload && typeof payload === "object"
      ? (payload as Partial<PersistedAppStateV1> & Partial<AppState>)
      : {};

  if (candidate.version === PERSISTED_STATE_VERSION && "state" in candidate) {
    return normalizeAppState(candidate.state);
  }

  return normalizeAppState(candidate);
}
