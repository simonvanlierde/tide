import { describe, expect, it } from "vitest";
import { buildCycleSummary } from "../../src/domain/cycle";
import type { IsoDate } from "../../src/domain/types";
import {
  buildCycleSegments,
  getSegmentStatus,
} from "../../src/features/today/CycleView";

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

    const segments = buildCycleSegments(summary, periodDays, today, true);

    // 28-day learned cycle -> one segment per day, no phantom next-cycle day.
    expect(segments).toHaveLength(28);

    // Logged bleeding falls on cycle days 1 and 2 (2026-04-02 / 2026-04-03).
    expect(segments[0]).toEqual({
      dayNumber: 1,
      date: "2026-04-02",
      isCurrent: false,
      isPeriod: true,
      flow: "medium",
      isFertile: false,
      isOvulation: false,
    });
    expect(segments[1]?.isPeriod).toBe(true);
    expect(segments[2]?.isPeriod).toBe(false);

    // Today is cycle day 17.
    expect(segments[16]?.dayNumber).toBe(17);
    expect(segments[16]?.isCurrent).toBe(true);
    expect(segments[16]?.date).toBe(today);

    // Ovulation lands on cycle day 15. Cycle lengths [28,29,27] have sub-day
    // spread (stddev ≈ 0.8), which floors to no widening — a regular cycler keeps
    // the tight −5/+1 biological window, so the fertile window spans days 10-16.
    expect(segments[14]?.isOvulation).toBe(true);
    expect(segments.filter((s) => s.isFertile).map((s) => s.dayNumber)).toEqual(
      [10, 11, 12, 13, 14, 15, 16],
    );
  });

  it("sizes the ring to a short learned cycle without padding to 28", () => {
    const today: IsoDate = "2026-06-06";
    const periodDays: IsoDate[] = ["2026-06-01", "2026-06-02"];
    const summary = buildCycleSummary({
      today,
      periodDays,
      completedCycleLengths: [24, 24, 25], // median 24
    });

    const segments = buildCycleSegments(summary, periodDays, today, true);

    // A 24-day cycle gets a 24-day ring — not the old 28-day floor. The next
    // period then lands on the day past the arc (the dial's nub), so the ring
    // holds no phantom "Period expected" tail inside it.
    expect(segments).toHaveLength(24);
    expect(segments.at(-1)?.date).toBe("2026-06-24");
    expect(summary.nextPeriod.date).toBe("2026-06-25");
    expect(
      segments.some(
        (s) => getSegmentStatus(s, summary) === "status.periodExpected",
      ),
    ).toBe(false);
  });

  it("maps a fallback 28-day cycle from a single logged start", () => {
    const today: IsoDate = "2026-04-19";
    const periodDays: IsoDate[] = ["2026-04-19", "2026-04-20"];
    const summary = buildCycleSummary({
      today,
      periodDays,
      completedCycleLengths: [],
    });

    const segments = buildCycleSegments(summary, periodDays, today, true);

    expect(segments).toHaveLength(28);
    // Only the day on/before today counts as logged (2026-04-20 is in the future).
    expect(segments[0]).toMatchObject({
      dayNumber: 1,
      isPeriod: true,
      isCurrent: true,
    });
    expect(segments[14]?.isOvulation).toBe(true);
  });

  it("omits fertile and ovulation segments when fertility is hidden", () => {
    const today: IsoDate = "2026-04-18";
    const periodDays: IsoDate[] = ["2026-04-19", "2026-04-20"];
    const summary = buildCycleSummary({
      today,
      periodDays,
      completedCycleLengths: [],
    });

    const segments = buildCycleSegments(summary, periodDays, today, false);

    expect(segments.some((segment) => segment.isFertile)).toBe(false);
    expect(segments.some((segment) => segment.isOvulation)).toBe(false);
  });

  it("returns a flat 28-day track when the cycle day is unknown", () => {
    const today: IsoDate = "2026-04-18";
    const summary = buildCycleSummary({
      today,
      periodDays: [],
      completedCycleLengths: [],
    });

    const segments = buildCycleSegments(summary, [], today, true);

    expect(segments).toHaveLength(28);
    expect(
      segments.every(
        (s) => !s.isCurrent && !s.isPeriod && !s.isFertile && !s.isOvulation,
      ),
    ).toBe(true);
    expect(segments.every((s) => s.date === null)).toBe(true);
  });
});

describe("getSegmentStatus", () => {
  const today: IsoDate = "2026-04-18";
  const periodDays: IsoDate[] = ["2026-04-02", "2026-04-03"];
  const summary = buildCycleSummary({
    today,
    periodDays,
    completedCycleLengths: [28],
  });
  const segments = buildCycleSegments(summary, periodDays, today, true);

  function statusOf(dayNumber: number) {
    const segment = segments[dayNumber - 1];
    if (!segment) {
      throw new Error(`no segment for day ${dayNumber}`);
    }
    return getSegmentStatus(segment, summary);
  }

  it("labels each kind of cycle day", () => {
    expect(statusOf(1)).toBe("status.period");
    expect(statusOf(5)).toBe("phase.follicular");
    expect(statusOf(10)).toBe("status.fertileWindow");
    expect(statusOf(15)).toBe("status.ovulationExpected");
    expect(statusOf(20)).toBe("phase.luteal");
  });

  it("marks overdue days past the predicted period start", () => {
    const overdueToday: IsoDate = "2026-05-01";
    const overdueSummary = buildCycleSummary({
      today: overdueToday,
      periodDays,
      completedCycleLengths: [28],
    });
    const overdueSegments = buildCycleSegments(
      overdueSummary,
      periodDays,
      overdueToday,
      true,
    );

    const lastSegment = overdueSegments.at(-1);
    expect(lastSegment?.date).toBe(overdueToday);
    expect(lastSegment && getSegmentStatus(lastSegment, overdueSummary)).toBe(
      "status.periodExpected",
    );
  });

  it("returns no status without cycle data", () => {
    const unknownSummary = buildCycleSummary({
      today,
      periodDays: [],
      completedCycleLengths: [],
    });
    const unknownSegments = buildCycleSegments(unknownSummary, [], today, true);

    expect(
      unknownSegments[0] &&
        getSegmentStatus(unknownSegments[0], unknownSummary),
    ).toBe("");
  });
});
