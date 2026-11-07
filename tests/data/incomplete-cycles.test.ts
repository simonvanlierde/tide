import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultAppState, normalizeAppState, SCHEMA_VERSION } from "../../src/data/schema";
import { BACKUP_KEY, clearAppState, loadStoredState, STORAGE_KEY, saveAppState } from "../../src/data/storage";
import { downloadAppState, parseImportedState } from "../../src/data/transfer";

const days = { "2026-01-01": null, "2026-01-29": null, "2026-03-26": null };
afterEach(() => vi.restoreAllMocks());

describe("incomplete cycle persistence", () => {
  it("migrates v2 without losing history or fertility preference", () => {
    expect(SCHEMA_VERSION).toBe(3);
    expect(normalizeAppState({ schemaVersion: 2, intensityByDay: days, settings: { showFertility: true } })).toEqual({
      ...defaultAppState,
      intensityByDay: days,
      settings: { ...defaultAppState.settings, showFertility: true },
    });
  });

  it("deduplicates valid completed markers and removes orphaned or invalid markers", () => {
    const result = normalizeAppState({
      schemaVersion: 3,
      intensityByDay: days,
      incompleteCycleStarts: ["2026-01-01", "2026-01-01", "2026-01-02", "2026-03-26", "2026-02-30", null],
      settings: { lastBackupOn: "2026-02-30", backupReminderDismissedOn: "2026-04-25" },
    });
    expect(result.incompleteCycleStarts).toEqual(["2026-01-01"]);
    expect(result.settings.lastBackupOn).toBeNull();
    expect(result.settings.backupReminderDismissedOn).toBe("2026-04-25");
    expect(normalizeAppState({ ...result, schemaVersion: 3 })).toEqual(result);
  });

  it("drops markers when corrupt logs remove a possible interval boundary", () => {
    const result = normalizeAppState({
      schemaVersion: 3,
      intensityByDay: { ...days, "2026-02-20": "invalid" },
      incompleteCycleStarts: ["2026-01-29"],
    });
    expect(result.incompleteCycleStarts).toEqual([]);
  });

  it("exports and restores markers while keeping backup metadata on this device", async () => {
    const state = normalizeAppState({
      schemaVersion: 3,
      intensityByDay: days,
      incompleteCycleStarts: ["2026-01-29"],
      settings: { lastBackupOn: "2026-04-01", backupReminderDismissedOn: "2026-04-20" },
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:tide-backup");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    downloadAppState(state);
    const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
    const text = await blob.text();
    expect(text).not.toContain("lastBackupOn");
    expect(text).not.toContain("backupReminderDismissedOn");
    expect(parseImportedState(text, "2026-04-25")).toEqual({
      ...state,
      settings: { ...state.settings, lastBackupOn: null, backupReminderDismissedOn: null },
    });
  });

  it("round-trips v3 markers and local metadata in storage, then clears both stored copies", () => {
    const state = normalizeAppState({
      schemaVersion: 3,
      intensityByDay: days,
      incompleteCycleStarts: ["2026-01-29"],
      settings: { lastBackupOn: "2026-04-01", backupReminderDismissedOn: "2026-04-20" },
    });
    saveAppState(state);
    expect(loadStoredState()).toEqual({ state, readOnly: false });
    expect(window.localStorage.getItem(BACKUP_KEY)).toBeNull();
    window.localStorage.setItem(BACKUP_KEY, "old copy");
    clearAppState();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(BACKUP_KEY)).toBeNull();
    expect(loadStoredState().state).toEqual(defaultAppState);
  });

  it("drops a marker whose ending boundary is removed by future-date filtering", () => {
    const imported = parseImportedState(
      JSON.stringify({ schemaVersion: 3, days, incompleteCycleStarts: ["2026-01-29"] }),
      "2026-02-01",
    );
    expect(imported.incompleteCycleStarts).toEqual([]);
  });
});
