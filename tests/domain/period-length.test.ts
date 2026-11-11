import { describe, expect, it, vi } from "vitest";
import { getAveragePeriodLength } from "../../src/domain/cycle";
import type { IsoDate } from "../../src/domain/types";
import { addDays } from "../../src/utils/date";

describe("period duration", () => {
  it.each<{ days: IsoDate[]; today: IsoDate; expected: number }>([
    { days: [], today: "2026-03-01", expected: 4 },
    { days: ["2026-03-01"], today: "2026-03-05", expected: 4 },
    { days: ["2026-03-01"], today: "2026-03-06", expected: 2 },
    { days: ["2026-01-04", "2026-01-01", "2026-01-04"], today: "2026-03-01", expected: 4 },
    { days: ["2026-01-01", "2026-01-10"], today: "2026-03-01", expected: 7 },
    { days: ["2026-01-01", "2026-01-11"], today: "2026-03-01", expected: 2 },
    { days: ["2026-01-01", "2026-01-07", "2026-02-01"], today: "2026-02-05", expected: 7 },
    { days: ["2026-01-01", "2026-01-07", "2026-02-01"], today: "2026-02-06", expected: 4 },
    { days: ["2026-03-01"], today: "2026-02-01", expected: 4 },
  ])("keeps run and completion rules for $days on $today", ({ days, today, expected }) => {
    const original = [...days];
    expect(getAveragePeriodLength(days, today)).toBe(expected);
    expect(days).toEqual(original);
  });

  it("does not rescan every logged day for every period", () => {
    function countFilterVisits(cycles: number) {
      const days = Array.from({ length: cycles }, (_cycle, cycle) =>
        Array.from({ length: 5 }, (_day, offset) => addDays("2020-01-01", cycle * 28 + offset)),
      ).flat();
      let visits = 0;
      const originalFilter = Array.prototype.filter;
      const spy = vi.spyOn(Array.prototype, "filter").mockImplementation(function (
        this: unknown[],
        predicate,
        thisArg,
      ) {
        return originalFilter.call(this, (value, index, array) => {
          visits++;
          return predicate.call(thisArg, value, index, array);
        });
      });
      try {
        expect(getAveragePeriodLength(days, "2030-01-01")).toBe(5);
      } finally {
        spy.mockRestore();
      }
      return visits;
    }
    const small = countFilterVisits(10);
    const large = countFilterVisits(100);
    expect(large).toBeLessThanOrEqual(15 * Math.max(1, small));
  });
});
