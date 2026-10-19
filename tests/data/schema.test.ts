import { describe, expect, it } from "vitest";
import { defaultAppState, normalizeAppState } from "../../src/data/schema";

describe("schema normalization at the storage trust boundary", () => {
  it("returns default state when the persisted blob is not an object", () => {
    expect(normalizeAppState("garbage")).toEqual(defaultAppState);
    expect(normalizeAppState(null)).toEqual(defaultAppState);
  });

  it("drops dates that match the shape but overflow the month", () => {
    const state = normalizeAppState({
      intensityByDay: {
        "2023-02-29": "heavy", // not a leap year
        "2026-04-31": "light",
        "2024-02-29": "medium", // leap year: valid
      },
    });
    expect(Object.keys(state.intensityByDay)).toEqual(["2024-02-29"]);
  });

  it("falls back to default settings for unknown enum values and non-booleans", () => {
    const state = normalizeAppState({
      intensityByDay: {},
      settings: {
        theme: "sepia",
        language: "xx",
        showFertility: "yes",
        showCycleDayNumbers: 1,
        // Would end the UID line and start a new one in a calendar file.
        calendarId: "x\r\nBEGIN:VEVENT",
      },
    });
    expect(state.settings).toEqual(defaultAppState.settings);
  });

  it("keeps a calendar id of the shape crypto.randomUUID makes", () => {
    const calendarId = "3f2b8c1e-9a4d-4e7b-b6f0-2c5d8a1e7f93";
    expect(normalizeAppState({ settings: { calendarId } }).settings).toEqual({
      ...defaultAppState.settings,
      calendarId,
    });
  });

  it("asks again where showFertility was only ever the old default", () => {
    // Before version 2, true was the default nobody chose: back to unasked.
    for (const blob of [
      { settings: { showFertility: true } },
      { schemaVersion: 1, settings: { showFertility: true } },
    ]) {
      expect(normalizeAppState(blob).settings.showFertility).toBeNull();
    }
    // false could only come from the Settings switch, so it is an answer.
    expect(
      normalizeAppState({
        schemaVersion: 1,
        settings: { showFertility: false },
      }).settings.showFertility,
    ).toBe(false);
    // From version 2 on, true is an answer too.
    expect(
      normalizeAppState({ schemaVersion: 2, settings: { showFertility: true } })
        .settings.showFertility,
    ).toBe(true);
    expect(
      normalizeAppState({ schemaVersion: 2, settings: { showFertility: null } })
        .settings.showFertility,
    ).toBeNull();
  });
});
