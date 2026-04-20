import type { AppState } from "../domain/types";
import { normalizePersistedState, toBackupPayload } from "./schema";

export function exportBackup(state: AppState) {
  return JSON.stringify(toBackupPayload(state), null, 2);
}

export function importBackup(payload: string): AppState {
  const normalizedPayload = payload.trim().replace(/^\uFEFF/, "");

  try {
    return normalizePersistedState(JSON.parse(normalizedPayload));
  } catch {
    throw new Error("Unexpected backup file format");
  }
}
