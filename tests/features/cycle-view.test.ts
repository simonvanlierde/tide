import { describe, expect, it } from "vitest";
import { buildCycleSummary } from "../../src/domain/cycle";
import type { IsoDate } from "../../src/domain/types";
import { buildCycleSegments } from "../../src/features/today/CycleView";

describe("buildCycleSegments", () => {
  it("maps a learned cycle with logged days onto day segments", () => {
    const today: IsoDate = "2026-04-18";
    const periodDays: IsoDate[] = [
      "2026-03-20",
      "2026-03-21",
      "2026-04-02",
      "2026-04-03",
    ];
    const summary = buildCycleSummary({
      today,
      periodDays,
      completedCycleLengths: [28, 29, 27],
    });

    const segments = buildCycleSegments(summary, periodDays, today);

    // 28-day learned cycle -> one segment per day, no phantom next-cycle day.
    expect(segments).toHaveLength(28);

    // Logged bleeding falls on cycle days 1 and 2 (2026-04-02 / 2026-04-03).
    expect(segments[0]).toEqual({
      dayNumber: 1,
      isCurrent: false,
      isPeriod: true,
      isFertile: false,
      isOvulation: false,
    });
    expect(segments[1]?.isPeriod).toBe(true);
    expect(segments[2]?.isPeriod).toBe(false);

    // Today is cycle day 17.
    expect(segments[16]?.dayNumber).toBe(17);
    expect(segments[16]?.isCurrent).toBe(true);

    // Ovulation lands on cycle day 15, fertile window spans days 10-16.
    expect(segments[14]?.isOvulation).toBe(true);
    expect(segments.filter((s) => s.isFertile).map((s) => s.dayNumber)).toEqual(
      [10, 11, 12, 13, 14, 15, 16],
    );
  });

  it("maps a fallback 28-day cycle from a single logged start", () => {
    const today: IsoDate = "2026-04-19";
    const periodDays: IsoDate[] = ["2026-04-19", "2026-04-20"];
    const summary = buildCycleSummary({
      today,
      periodDays,
      completedCycleLengths: [],
    });

    const segments = buildCycleSegments(summary, periodDays, today);

    expect(segments).toHaveLength(28);
    // Only the day on/before today counts as logged (2026-04-20 is in the future).
    expect(segments[0]).toMatchObject({
      dayNumber: 1,
      isPeriod: true,
      isCurrent: true,
    });
    expect(segments[14]?.isOvulation).toBe(true);
  });

  it("returns a flat 28-day track when the cycle day is unknown", () => {
    const today: IsoDate = "2026-04-18";
    const summary = buildCycleSummary({
      today,
      periodDays: [],
      completedCycleLengths: [],
    });

    const segments = buildCycleSegments(summary, [], today);

    expect(segments).toHaveLength(28);
    expect(
      segments.every(
        (s) => !s.isCurrent && !s.isPeriod && !s.isFertile && !s.isOvulation,
      ),
    ).toBe(true);
  });
});
