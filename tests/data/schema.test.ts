import { describe, expect, it } from "vitest";
import {
  defaultAppState,
  normalizeAppState,
  normalizePeriodDays,
} from "../../src/data/schema";

describe("schema normalization at the storage trust boundary", () => {
  it("falls back to no period days when the stored value is not an array", () => {
    expect(normalizePeriodDays("2026-04-02")).toEqual([]);
    expect(normalizePeriodDays(null)).toEqual([]);
  });

  it("returns default state when the persisted blob is not an object", () => {
    expect(normalizeAppState("garbage")).toEqual(defaultAppState);
    expect(normalizeAppState(null)).toEqual(defaultAppState);
  });

  it("migrates the retired showPeriodDayNumbers setting", () => {
    // A user who turned day numbers off before the rename keeps them off.
    const migrated = normalizeAppState({
      intensityByDay: {},
      settings: { showPeriodDayNumbers: false },
    });
    expect(migrated.settings.showCycleDayNumbers).toBe(false);
  });
});
