import { describe, expect, it } from "vitest";
import type { CycleSummary } from "../../src/domain/types";
import {
  buildCalendarMarkers,
  buildMonthDays,
} from "../../src/features/history/calendar";

describe("history calendar helpers", () => {
  it("builds a full month grid with adjacent-month days and future metadata", () => {
    const days = buildMonthDays("2026-04-18", "2026-04-21");

    expect(days).toHaveLength(35);
    expect(days[0]).toMatchObject({
      value: "2026-03-30",
      isOutsideMonth: true,
      isFuture: false,
      isToday: false,
    });
    expect(days[22]).toMatchObject({
      value: "2026-04-21",
      isOutsideMonth: false,
      isFuture: false,
      isToday: true,
    });
    expect(days[23]).toMatchObject({
      value: "2026-04-22",
      isOutsideMonth: false,
      isFuture: true,
      isToday: false,
    });
  });

  it("keeps six rows when a month needs trailing week coverage", () => {
    const days = buildMonthDays("2026-08-15", "2026-08-21");

    expect(days).toHaveLength(42);
    expect(days[41]).toMatchObject({
      value: "2026-09-06",
      isOutsideMonth: true,
    });
  });

  it("marks the fertile window, ovulation, and next expected period", () => {
    const summary: CycleSummary = {
      cycleDay: 10,
      phaseLabel: "follicular",
      fertile: false,
      ovulationDate: "2026-04-14",
      nextPeriod: { date: "2026-04-28", daysUntil: 14 },
      estimateMode: "learned",
    };

    const markers = buildCalendarMarkers(summary);

    // Fertile window spans ovulation-5 through ovulation+1, with ovulation
    // itself overriding the fertile marker on its own day.
    expect(markers.get("2026-04-09")).toBe("fertile");
    expect(markers.get("2026-04-14")).toBe("ovulation");
    expect(markers.get("2026-04-15")).toBe("fertile");
    expect(markers.get("2026-04-28")).toBe("predicted-period");
    expect(markers.has("2026-04-08")).toBe(false);
  });

  it("produces no markers before a cycle can be estimated", () => {
    const summary: CycleSummary = {
      cycleDay: null,
      phaseLabel: "unknown",
      fertile: false,
      ovulationDate: null,
      nextPeriod: { date: null, daysUntil: null },
      estimateMode: "insufficient",
    };

    expect(buildCalendarMarkers(summary).size).toBe(0);
  });
});
