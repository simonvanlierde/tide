import fc from "fast-check";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateLoggedDays } from "../../src/data/schema";
import { getCycleHistory } from "../../src/domain/cycle";
import { getPeriodRange } from "../../src/domain/flow";
import type { IsoDate } from "../../src/domain/types";
import { appStateReducer } from "../../src/state/core";
import { addDays } from "../../src/utils/date";
import { createAppState } from "../support/app";

vi.mock("../../src/data/schema", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/data/schema")>();
  return { ...actual, updateLoggedDays: vi.fn(actual.updateLoggedDays) };
});

beforeEach(() => {
  vi.mocked(updateLoggedDays).mockClear();
});

describe("range logging reconciles history once", () => {
  it("batches a whole period while keeping existing flow", () => {
    const state = createAppState({ intensityByDay: { "2026-03-05": "heavy" } });
    const next = appStateReducer(state, {
      type: "logPeriodRange",
      from: "2026-03-14",
      to: "2026-03-01",
      today: "2026-03-14",
    });
    expect(Object.keys(next.intensityByDay)).toHaveLength(14);
    expect(next.intensityByDay["2026-03-05"]).toBe("heavy");
    expect(updateLoggedDays).toHaveBeenCalledTimes(1);
  });

  it("returns the original state without reconciliation when nothing can be added", () => {
    const state = createAppState({ periodDays: ["2026-03-01"] });
    for (const [from, to] of [
      ["2026-03-01", "2026-03-01"],
      ["2026-03-15", "2026-03-20"],
    ] as const) {
      expect(appStateReducer(state, { type: "logPeriodRange", from, to, today: "2026-03-14" })).toBe(state);
    }
    expect(updateLoggedDays).not.toHaveBeenCalled();
  });

  it("matches individual logging for generated ranges, including interval exclusions", () => {
    fc.assert(
      fc.property(
        fc.array(fc.boolean(), { minLength: 60, maxLength: 60 }),
        fc.integer({ min: 0, max: 80 }),
        fc.integer({ min: 0, max: 13 }),
        (logged, offset, span) => {
          const days = logged.flatMap((yes, index) => (yes ? [addDays("2026-01-01", index)] : []));
          const state = createAppState({
            periodDays: days,
            settings: { calendarId: "00000000-0000-4000-8000-000000000001" },
            incompleteCycleStarts: getCycleHistory(days).map((cycle) => cycle.start),
          });
          const from = addDays("2026-01-01", offset);
          const to = addDays(from, span);
          const today: IsoDate = "2026-03-15";
          const expected = (getPeriodRange(from, to) ?? []).reduce(
            (next, day) =>
              day in next.intensityByDay ? next : appStateReducer(next, { type: "togglePeriodDay", day, today }),
            state,
          );
          expect(appStateReducer(state, { type: "logPeriodRange", from, to, today })).toEqual(expected);
        },
      ),
      { numRuns: 300 },
    );
  });
});
