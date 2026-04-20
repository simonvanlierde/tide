import { beforeEach, describe, expect, it } from "vitest";
import { exportBackup, importBackup } from "../../src/data/exportImport";
import { loadAppState, saveAppState } from "../../src/data/storage";
import { createAppState } from "../support/appState";
import { STORAGE_KEY } from "../support/storage";

describe("local storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips app state through a versioned storage record", () => {
    const state = createAppState({
      periodDays: ["2026-04-02"],
      settings: {
        reminderWindowDays: 4,
        snoozedUntil: null,
        homeDisplayMode: "summary",
      },
    });

    saveAppState(state);

    expect(loadAppState()).toEqual(state);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "")).toMatchObject(
      {
        version: 1,
        state,
      },
    );
  });

  it("exports and restores a versioned backup file payload", () => {
    const state = createAppState({
      periodDays: ["2026-04-02"],
    });

    const backup = exportBackup(state);

    expect(importBackup(backup)).toEqual(state);
    expect(JSON.parse(backup)).toMatchObject({
      version: 1,
      state,
    });
  });

  it("imports the current Tide format even with a UTF-8 BOM", () => {
    const state = createAppState({
      periodDays: ["2026-04-02"],
    });

    const backup = `\uFEFF${exportBackup(state)}`;

    expect(importBackup(backup)).toEqual(state);
  });

  it("rejects malformed backup payloads", () => {
    expect(() => importBackup("{ bad json")).toThrow(/unexpected/i);
  });

  it("recovers safely from corrupted local storage", () => {
    window.localStorage.setItem(STORAGE_KEY, "{ definitely not json");

    expect(loadAppState()).toEqual(createAppState());
  });

  it("fills in defaults for older stored state", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        periodDays: ["2026-04-02"],
        settings: { reminderWindowDays: 4, snoozedUntil: null },
      }),
    );

    expect(loadAppState()).toEqual(
      createAppState({
        periodDays: ["2026-04-02"],
        settings: {
          reminderWindowDays: 4,
          snoozedUntil: null,
          homeDisplayMode: "summary",
        },
      }),
    );
  });

  it("normalizes imported backup data and removes invalid dates", () => {
    const imported = importBackup(
      JSON.stringify({
        version: 1,
        state: {
          periodDays: [
            "2026-04-02",
            "bad-date",
            "2026-04-02",
            "2026-03-20",
            123,
          ],
          settings: {
            reminderWindowDays: "nope",
            snoozedUntil: "2026-04-22",
            homeDisplayMode: "gallery",
          },
        },
      }),
    );

    expect(imported).toEqual(
      createAppState({
        periodDays: ["2026-03-20", "2026-04-02"],
        settings: {
          reminderWindowDays: 4,
          snoozedUntil: "2026-04-22",
          homeDisplayMode: "summary",
        },
      }),
    );
  });

  it("supports the legacy backup shape for backward compatibility", () => {
    const imported = importBackup(
      JSON.stringify({
        periodDays: ["2026-04-02"],
        settings: {
          reminderWindowDays: 4,
          snoozedUntil: null,
          homeDisplayMode: "summary",
        },
      }),
    );

    expect(imported).toEqual(
      createAppState({
        periodDays: ["2026-04-02"],
      }),
    );
  });
});
