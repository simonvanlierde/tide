import { describe, expect, it } from "vitest";
import { getPeriodDays } from "../../src/domain/flow";
import { appStateReducer, selectCycleSummary } from "../../src/state/core";
import { createAppState, createLearnedCycleState } from "../support/app";

describe("app state core selectors", () => {
  it("reduces a toggled bleeding day into sorted period days", () => {
    const initialState = createAppState({
      periodDays: ["2026-04-12", "2026-04-02"],
    });

    const nextState = appStateReducer(initialState, {
      type: "togglePeriodDay",
      day: "2026-04-05",
      today: "2026-04-30",
    });

    expect(getPeriodDays(nextState.intensityByDay)).toEqual([
      "2026-04-02",
      "2026-04-05",
      "2026-04-12",
    ]);
  });

  it("refuses to log a future-dated bleeding day", () => {
    const nextState = appStateReducer(
      createAppState({ periodDays: ["2026-04-02"] }),
      { type: "togglePeriodDay", day: "2026-04-10", today: "2026-04-05" },
    );

    expect(getPeriodDays(nextState.intensityByDay)).toEqual(["2026-04-02"]);
  });

  it("still lets a stale future-dated day be removed", () => {
    const nextState = appStateReducer(
      createAppState({ periodDays: ["2026-04-02", "2026-04-10"] }),
      { type: "togglePeriodDay", day: "2026-04-10", today: "2026-04-05" },
    );

    expect(getPeriodDays(nextState.intensityByDay)).toEqual(["2026-04-02"]);
  });

  it("records a one-tap log with no flow level and prunes it on removal", () => {
    const logged = appStateReducer(createAppState(), {
      type: "togglePeriodDay",
      day: "2026-04-02",
      today: "2026-04-30",
    });
    // Null, not "medium": the tap said "I bled", not how much.
    expect(logged.intensityByDay).toEqual({ "2026-04-02": null });

    const removed = appStateReducer(logged, {
      type: "togglePeriodDay",
      day: "2026-04-02",
      today: "2026-04-30",
    });
    expect(removed.intensityByDay).toEqual({});
  });

  it("refines a logged day's flow via setDayIntensity", () => {
    const state = createAppState({
      periodDays: ["2026-04-02"],
      intensityByDay: { "2026-04-02": "medium" },
    });

    const next = appStateReducer(state, {
      type: "setDayIntensity",
      day: "2026-04-02",
      intensity: "spotting",
      today: "2026-04-30",
    });

    expect(next.intensityByDay["2026-04-02"]).toBe("spotting");
    expect(getPeriodDays(next.intensityByDay)).toEqual(["2026-04-02"]);
  });

  it("logs a past untracked day when setting its flow level", () => {
    const next = appStateReducer(createAppState({ periodDays: [] }), {
      type: "setDayIntensity",
      day: "2026-04-02",
      intensity: "light",
      today: "2026-04-18",
    });

    expect(getPeriodDays(next.intensityByDay)).toEqual(["2026-04-02"]);
    expect(next.intensityByDay).toEqual({ "2026-04-02": "light" });
  });

  it("refuses to set a flow level on a future, un-logged day", () => {
    const state = createAppState({ periodDays: ["2026-04-02"] });

    const next = appStateReducer(state, {
      type: "setDayIntensity",
      day: "2026-04-10",
      intensity: "heavy",
      today: "2026-04-05",
    });

    expect(next).toBe(state);
  });

  it("replaces state wholesale with an imported backup", () => {
    const imported = createAppState({
      periodDays: ["2026-04-12"],
      intensityByDay: { "2026-04-12": "light" },
    });

    const next = appStateReducer(createAppState({ periodDays: [] }), {
      type: "importState",
      state: imported,
    });

    expect(next).toBe(imported);
  });

  it("excludes spotting days from cycle predictions", () => {
    const spotting = createAppState({
      periodDays: ["2026-04-02"],
      intensityByDay: { "2026-04-02": "spotting" },
    });
    expect(selectCycleSummary(spotting, "2026-04-10").estimateMode).toBe(
      "insufficient",
    );

    // The same day logged as real bleeding does anchor a prediction.
    const bleeding = createAppState({ periodDays: ["2026-04-02"] });
    expect(selectCycleSummary(bleeding, "2026-04-10").estimateMode).toBe(
      "fallback",
    );
  });

  it("derives the cycle summary from plain app state", () => {
    const state = createLearnedCycleState();

    expect(selectCycleSummary(state, "2026-04-18")).toMatchObject({
      cycleDay: 17,
      phaseLabel: "luteal",
      nextPeriod: {
        date: "2026-04-30",
        daysUntil: 12,
      },
      estimateMode: "learned",
    });
  });

  it("ignores a future-dated day so one bad import entry can't poison the forecast", () => {
    const state = createAppState({
      periodDays: ["2026-08-01", "2026-08-02", "2026-08-03", "2099-01-01"],
    });
    const summary = selectCycleSummary(state, "2026-08-22");

    expect(summary.cycleDay).toBe(22);
    expect(summary.cycleLength).toBe(28);
    expect(summary.nextPeriod.date).toBe("2026-08-29");
  });
});
