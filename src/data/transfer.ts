import type { AppState } from "../domain/types";
import { normalizeAppState } from "./schema";

const EXPORT_FILENAME = "tide-backup.json";

// Download the current state as a JSON file the user can keep as a backup.
export function downloadAppState(state: AppState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = EXPORT_FILENAME;
  link.click();
  URL.revokeObjectURL(url);
}

// Parse an exported backup back into a valid AppState. Throws on unparseable
// JSON; normalizeAppState then drops anything malformed, so a hand-edited or
// foreign file can never corrupt state.
export function parseImportedState(text: string): AppState {
  return normalizeAppState(JSON.parse(text));
}
