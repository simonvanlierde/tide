import { describe, expect, it } from "vitest";
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
    });

    expect(nextState.periodDays).toEqual([
      "2026-04-02",
      "2026-04-05",
      "2026-04-12",
    ]);
  });

  it("normalizes replacement state through the current app-state shape only", () => {
    const nextState = appStateReducer(createAppState(), {
      type: "replaceState",
      state: {
        periodDays: ["2026-04-07", "bad-date", "2026-04-07"],
        settings: {
          reminderWindowDays: "invalid",
          snoozedUntil: "2026-04-08",
          homeDisplayMode: "gallery",
        },
      },
    });

    expect(nextState).toEqual(
      createAppState({
        periodDays: ["2026-04-07"],
        settings: {
          reminderWindowDays: 4,
          snoozedUntil: "2026-04-08",
          homeDisplayMode: "summary",
        },
      }),
    );
  });

  it("rejects the removed versioned storage envelope", () => {
    const nextState = appStateReducer(createAppState(), {
      type: "replaceState",
      state: {
        version: 1,
        state: createAppState({
          periodDays: ["2026-04-07"],
        }),
      },
    });

    expect(nextState).toEqual(createAppState());
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
});
