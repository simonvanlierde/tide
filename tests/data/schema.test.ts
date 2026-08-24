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
      },
    });
    expect(state.settings).toEqual(defaultAppState.settings);
  });
});
