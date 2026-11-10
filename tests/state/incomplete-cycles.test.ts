import { describe, expect, it } from "vitest";
import { normalizeAppState } from "../../src/data/schema";
import { mergeImportedDays } from "../../src/data/transfer";
import { appStateReducer, selectForecast } from "../../src/state/core";

const state = () =>
  normalizeAppState({
    schemaVersion: 3,
    intensityByDay: { "2026-01-01": null, "2026-01-29": null, "2026-03-26": null, "2026-04-23": null },
    incompleteCycleStarts: ["2026-01-29"],
  });

describe("incomplete cycle state", () => {
  it("toggles only completed intervals as of today and restores their estimates", () => {
    const initial = state();
    expect(selectForecast(initial, "2026-04-25").stats.recentCycleLengths).toEqual([28, 28]);
    const restored = appStateReducer(initial, {
      type: "toggleIncompleteCycle",
      start: "2026-01-29",
      today: "2026-04-25",
    });
    expect(restored.incompleteCycleStarts).toEqual([]);
    expect(selectForecast(restored, "2026-04-25").stats.recentCycleLengths).toEqual([28, 56, 28]);
    for (const start of ["2026-04-23", "2026-01-02"] as const) {
      expect(appStateReducer(initial, { type: "toggleIncompleteCycle", start, today: "2026-04-25" })).toBe(initial);
    }
    expect(appStateReducer(initial, { type: "toggleIncompleteCycle", start: "2026-01-29", today: "2026-02-01" })).toBe(
      initial,
    );
  });

  it("drops a marker when logging changes either interval boundary", () => {
    for (const day of ["2026-01-29", "2026-03-26", "2026-02-20"] as const) {
      const changed = appStateReducer(state(), { type: "togglePeriodDay", day, today: "2026-04-25" });
      expect(changed.incompleteCycleStarts).toEqual([]);
    }
  });

  it("keeps a marker when a log inside the same bleed leaves its boundaries unchanged", () => {
    const changed = appStateReducer(state(), { type: "togglePeriodDay", day: "2026-01-30", today: "2026-04-25" });
    expect(changed.incompleteCycleStarts).toEqual(["2026-01-29"]);
  });

  it("drops stale markers after spotting changes, range logging, and another app's import", () => {
    expect(
      appStateReducer(state(), {
        type: "setDayIntensity",
        day: "2026-03-26",
        intensity: "spotting",
        today: "2026-04-25",
      }).incompleteCycleStarts,
    ).toEqual([]);
    expect(
      appStateReducer(state(), { type: "logPeriodRange", from: "2026-02-20", to: "2026-02-22", today: "2026-04-25" })
        .incompleteCycleStarts,
    ).toEqual([]);
    expect(mergeImportedDays(state(), { "2026-02-20": null }).incompleteCycleStarts).toEqual([]);
  });
});
