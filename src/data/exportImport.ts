import type { AppState } from "../domain/types";

export function exportBackup(state: AppState) {
  return JSON.stringify(state, null, 2);
}

export function importBackup(payload: string): AppState {
  let parsed: Partial<AppState>;
  const normalizedPayload = payload.trim().replace(/^\uFEFF/, "");

  try {
    parsed = JSON.parse(normalizedPayload) as Partial<AppState>;
  } catch {
    throw new Error("Unexpected backup file format");
  }

  if (!Array.isArray(parsed.periodDays) || !parsed.settings || typeof parsed.settings !== "object") {
    throw new Error("Invalid backup file");
  }

  return parsed as AppState;
}
