import type { AppState, IsoDate, LoggedFlow } from "../domain/types";
import { normalizeAppState } from "./schema";

// Dated so repeated backups don't overwrite each other in Downloads.
const exportFilename = () =>
  `tide-backup-${new Date().toISOString().slice(0, 10)}.json`;

interface BackupFile {
  // The logged days and their flow — its keys are the period days, so they
  // aren't listed a second time. This is the app's own state shape.
  days: Record<IsoDate, LoggedFlow>;
  settings: Pick<
    AppState["settings"],
    "showFertility" | "showCycleDayNumbers" | "theme" | "language"
  >;
}

// Compact backup shape: the date -> flow map plus the durable settings. The
// reminder-dismissal is transient UI state and is intentionally omitted.
function toBackupFile(state: AppState): BackupFile {
  return {
    days: state.intensityByDay,
    settings: {
      showFertility: state.settings.showFertility,
      showCycleDayNumbers: state.settings.showCycleDayNumbers,
      theme: state.settings.theme,
      language: state.settings.language,
    },
  };
}

// Download the current state as a JSON file the user can keep as a backup.
export function downloadAppState(state: AppState) {
  const blob = new Blob([JSON.stringify(toBackupFile(state), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = exportFilename();
  link.click();
  // Safari can cancel the download if the URL is revoked before it starts.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

// Parse an exported backup back into a valid AppState. Throws on unparseable
// JSON and on JSON with no logged-days map at all (some other app's file),
// which would otherwise import as an empty history and replace the real one.
// normalizeAppState then drops anything malformed inside a real backup.
export function parseImportedState(text: string): AppState {
  const parsed: unknown = JSON.parse(text);
  const candidate =
    parsed && typeof parsed === "object" && "state" in parsed
      ? parsed.state
      : parsed;
  if (
    !candidate ||
    typeof candidate !== "object" ||
    !("days" in candidate || "intensityByDay" in candidate)
  ) {
    throw new Error("Not a Tide backup");
  }
  return normalizeAppState(parsed);
}
