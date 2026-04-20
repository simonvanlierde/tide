import { beforeEach, describe, expect, it } from "vitest";
import { exportBackup, importBackup } from "../../src/data/exportImport";
import { loadAppState, saveAppState } from "../../src/data/storage";
import type { AppState } from "../../src/domain/types";

describe("local storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips app state through storage", () => {
    const state: AppState = {
      periodDays: ["2026-04-02"],
      settings: {
        reminderWindowDays: 4,
        snoozedUntil: null,
        homeDisplayMode: "summary",
        homeCards: {
          showNextPeriodCard: true,
          showPhaseCard: true,
          showFertilityCard: true,
        },
      },
    };

    saveAppState(state);
    expect(loadAppState()).toEqual(state);
  });

  it("exports and restores a backup file payload", () => {
    const state: AppState = {
      periodDays: ["2026-04-02"],
      settings: {
        reminderWindowDays: 4,
        snoozedUntil: null,
        homeDisplayMode: "summary",
        homeCards: {
          showNextPeriodCard: true,
          showPhaseCard: true,
          showFertilityCard: true,
        },
      },
    };

    const backup = exportBackup(state);
    expect(importBackup(backup)).toEqual(state);
  });

  it("imports the current Tide format even with a UTF-8 BOM", () => {
    const state: AppState = {
      periodDays: ["2026-04-02"],
      settings: {
        reminderWindowDays: 4,
        snoozedUntil: null,
        homeDisplayMode: "summary",
        homeCards: {
          showNextPeriodCard: true,
          showPhaseCard: true,
          showFertilityCard: true,
        },
      },
    };

    const backup = `\uFEFF${exportBackup(state)}`;
    expect(importBackup(backup)).toEqual(state);
  });

  it("rejects malformed backup payloads", () => {
    expect(() => importBackup("{ bad json")).toThrow(/unexpected/i);
  });

  it("fills in appearance defaults for older stored state", () => {
    window.localStorage.setItem(
      "tide.period-tracker.state",
      JSON.stringify({
        periodDays: ["2026-04-02"],
        settings: { reminderWindowDays: 4, snoozedUntil: null },
      }),
    );

    expect(loadAppState()).toEqual({
      periodDays: ["2026-04-02"],
      settings: {
        reminderWindowDays: 4,
        snoozedUntil: null,
        homeDisplayMode: "summary",
        homeCards: {
          showNextPeriodCard: true,
          showPhaseCard: true,
          showFertilityCard: true,
        },
      },
    });
  });
});
