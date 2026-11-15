import { normalizeDailyDetails } from "../domain/diary";
import type { AppState, IsoDate, LoggedFlow } from "../domain/types";
import { getTodayIsoDate } from "../utils/date";
import { isIsoDate, isLoggedFlow, normalizeAppState, SCHEMA_VERSION, updateLoggedDays } from "./schema";

// Dated so repeated backups don't overwrite each other in Downloads.
// Local day, not UTC, so a backup made just after midnight carries today's date.
const exportFilename = () => `tide-backup-${getTodayIsoDate()}.json`;

interface BackupFile {
  // Read on import like the stored blob's: an older backup's showFertility was
  // never chosen (see normalizeAppState).
  schemaVersion: number;
  incompleteCycleStarts: IsoDate[];
  // The logged days and their flow — its keys are the period days, so they
  // aren't listed a second time. This is the app's own state shape.
  days: Record<IsoDate, LoggedFlow>;
  detailsByDay: AppState["detailsByDay"];
  settings: Pick<AppState["settings"], "showFertility" | "showCycleDayNumbers" | "theme" | "language" | "calendarId">;
}

// Compact backup shape: the date -> flow map plus the durable settings. The
// reminder-dismissal is transient UI state and is intentionally omitted.
function toBackupFile(state: AppState): BackupFile {
  return {
    schemaVersion: SCHEMA_VERSION,
    days: state.intensityByDay,
    detailsByDay: state.detailsByDay,
    incompleteCycleStarts: state.incompleteCycleStarts,
    settings: {
      showFertility: state.settings.showFertility,
      showCycleDayNumbers: state.settings.showCycleDayNumbers,
      theme: state.settings.theme,
      language: state.settings.language,
      calendarId: state.settings.calendarId,
    },
  };
}

export function downloadText(text: string, filename: string, type = "application/json") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  // Safari can cancel the download if the URL is revoked before it starts.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

// Download the current state as a JSON file the user can keep as a backup.
export function downloadAppState(state: AppState) {
  downloadText(JSON.stringify(toBackupFile(state), null, 2), exportFilename());
}

// Download the stored blob untouched, for the crash screen: whatever broke the
// app may be in the data, so nothing here parses or normalizes it.
export function downloadRawState(raw: string) {
  downloadText(raw, `tide-raw-${getTodayIsoDate()}.json`);
}

// Parse an exported backup back into a valid AppState. Throws on unparseable
// JSON and on JSON with no logged-days map at all (some other app's file),
// which would otherwise import as an empty history and replace the real one.
// A backup from a newer build is refused too: importing it would drop the
// fields this build does not know and save the rest as the current version.
// normalizeAppState then drops anything malformed inside a real backup, and
// days after `today` go too: Tide never logs one.
export function parseImportedState(text: string, today: IsoDate = getTodayIsoDate()): AppState {
  const parsed: unknown = JSON.parse(text);
  const candidate = parsed && typeof parsed === "object" && "state" in parsed ? parsed.state : parsed;
  if (!candidate || typeof candidate !== "object" || !("days" in candidate || "intensityByDay" in candidate)) {
    throw new Error("Not a Tide backup");
  }
  // A logged-days key that is not a map of known flow values would import as an
  // empty history and replace the real one.
  for (const key of ["days", "intensityByDay"] as const) {
    if (!(key in candidate)) continue;
    const days = (candidate as Record<string, unknown>)[key];
    if (
      !days ||
      typeof days !== "object" ||
      Array.isArray(days) ||
      Object.values(days).some((flow) => !isLoggedFlow(flow))
    )
      throw new Error("Not a Tide backup");
  }
  const version = (parsed as { schemaVersion?: unknown }).schemaVersion;
  if (typeof version === "number" && version > SCHEMA_VERSION) {
    throw new Error("Backup is from a newer Tide");
  }
  // Refuse malformed diary data instead of importing a backup with missing notes.
  if ("detailsByDay" in candidate) {
    const details = candidate.detailsByDay;
    if (
      !details ||
      typeof details !== "object" ||
      Array.isArray(details) ||
      Object.entries(details).some(([day, value]) => !isIsoDate(day) || !normalizeDailyDetails(value))
    )
      throw new Error("Invalid daily details in backup");
  }
  const state = normalizeAppState(parsed);
  // Filter before updateLoggedDays: it compares the old and new cycle starts, and a
  // dropped future day must not count as a renumbering that resets the calendar id.
  const intensityByDay = Object.fromEntries(Object.entries(state.intensityByDay).filter(([day]) => day <= today));
  return updateLoggedDays(
    {
      ...state,
      intensityByDay,
      detailsByDay: Object.fromEntries(Object.entries(state.detailsByDay).filter(([day]) => day <= today)),
    },
    intensityByDay,
  );
}

// An import replaces the history but not what describes this device: its backup
// dates and Calendar guidance stay, and so does its calendar identity when the
// file has none, so the next export still updates the events already in the
// user's calendar. A successful import completes the first-run introduction.
export function keepDeviceSettings(current: AppState, next: AppState): AppState {
  const { lastBackupOn, backupReminderDismissedOn, calendarHelpDismissed, calendarId } = current.settings;
  return {
    ...next,
    settings: {
      ...next.settings,
      calendarId: next.settings.calendarId ?? calendarId,
      lastBackupOn,
      backupReminderDismissedOn,
      calendarHelpDismissed,
      onboardingDismissed: true,
    },
  };
}

// Days from another app's export (see otherApps.ts). Kept here, not in the
// lazy chunk, so the merge runs on the state current when the user confirms.
// Imported days fill only the days not logged here: what the user already
// logged in Tide wins over another app's record of the same day.
export function mergeImportedDays(state: AppState, days: Record<IsoDate, LoggedFlow>): AppState {
  return updateLoggedDays(state, { ...days, ...state.intensityByDay });
}
