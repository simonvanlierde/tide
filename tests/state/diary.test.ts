import { describe, expect, it } from "vitest";
import { appStateReducer, selectForecast } from "../../src/state/core";
import { createAppState } from "../support/app";

const day = "2026-04-02";
const details = { symptoms: ["cramps"] as const, mood: "okay" as const, note: "Rested" };

describe("daily details actions", () => {
  it("logs independent details without changing bleeding or the forecast", () => {
    const state = createAppState();
    const next = appStateReducer(state, {
      type: "setDayDetails",
      day,
      today: day,
      details: { ...details, symptoms: [...details.symptoms] },
    });
    expect(next.detailsByDay[day]).toEqual(details);
    expect(next.intensityByDay).toEqual({});
    expect(selectForecast(next, day)).toMatchObject({ ...selectForecast(state, day), dayInfo: expect.any(Function) });
    const bleeding = appStateReducer(next, { type: "togglePeriodDay", day, today: day });
    expect(appStateReducer(bleeding, { type: "togglePeriodDay", day, today: day }).detailsByDay).toEqual(
      next.detailsByDay,
    );
  });

  it("removes empty records but preserves explicit no symptoms", () => {
    const state = createAppState();
    const next = appStateReducer(state, {
      type: "setDayDetails",
      day,
      today: day,
      details: { symptoms: [], mood: null, note: "" },
    });
    expect(next.detailsByDay[day]?.symptoms).toEqual([]);
    expect(
      appStateReducer(next, {
        type: "setDayDetails",
        day,
        today: day,
        details: { symptoms: null, mood: null, note: "" },
      }).detailsByDay,
    ).toEqual({});
  });

  it("ignores invalid or future detail writes", () => {
    const state = createAppState();
    for (const [date, note] of [
      ["2026-04-03", "future"],
      ["2026-02-30", "invalid date"],
      [day, "x".repeat(1001)],
    ] as const) {
      expect(
        appStateReducer(state, {
          type: "setDayDetails",
          day: date,
          today: day,
          details: { symptoms: null, mood: null, note },
        }),
      ).toBe(state);
    }
  });
});
