import { beforeEach, describe, expect, it } from "vitest";
import { exportBackup, importBackup } from "../../src/data/exportImport";
import { loadAppState, saveAppState } from "../../src/data/storage";

describe("local storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips app state through storage", () => {
    const state = {
      periodDays: ["2026-04-02"],
      settings: {
        reminderWindowDays: 4,
        snoozedUntil: null,
        homeLayoutMode: "circular",
        showPhaseChip: true,
        showFertilityChip: true
      }
    };

    saveAppState(state);
    expect(loadAppState()).toEqual(state);
  });

  it("exports and restores a backup file payload", () => {
    const state = {
      periodDays: ["2026-04-02"],
      settings: {
        reminderWindowDays: 4,
        snoozedUntil: null,
        homeLayoutMode: "circular",
        showPhaseChip: true,
        showFertilityChip: true
      }
    };

    const backup = exportBackup(state);
    expect(importBackup(backup)).toEqual(state);
  });

  it("imports the current Tide format even with a UTF-8 BOM", () => {
    const state = {
      periodDays: ["2026-04-02"],
      settings: {
        reminderWindowDays: 4,
        snoozedUntil: null,
        homeLayoutMode: "circular",
        showPhaseChip: true,
        showFertilityChip: true
      }
    };

    const backup = `\uFEFF${exportBackup(state)}`;
    expect(importBackup(backup)).toEqual(state);
  });

  it("rejects malformed backup payloads", () => {
    expect(() => importBackup("{ bad json")).toThrow(/unexpected/i);
  });

  it("fills in new UI preference defaults for older stored state", () => {
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: ["2026-04-02"],
        settings: { reminderWindowDays: 4, snoozedUntil: null }
      })
    );

    expect(loadAppState()).toEqual({
      periodDays: ["2026-04-02"],
      settings: {
        reminderWindowDays: 4,
        snoozedUntil: null,
        homeLayoutMode: "circular",
        showPhaseChip: true,
        showFertilityChip: true
      }
    });
  });
});
