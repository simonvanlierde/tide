import { describe, expect, it } from "vitest";
import { getAveragePeriodLength } from "../../src/domain/cycle";
import type { IsoDate } from "../../src/domain/types";

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
    // Periods of 4 and 5 days average 4.5, which rounds up.
    {
      days: [
        "2026-01-01",
        "2026-01-02",
        "2026-01-03",
        "2026-01-04",
        "2026-02-01",
        "2026-02-02",
        "2026-02-03",
        "2026-02-04",
        "2026-02-05",
      ],
      today: "2026-03-01",
      expected: 5,
    },
  ])("keeps run and completion rules for $days on $today", ({ days, today, expected }) => {
    const original = [...days];
    expect(getAveragePeriodLength(days, today)).toBe(expected);
    expect(days).toEqual(original);
  });
});
