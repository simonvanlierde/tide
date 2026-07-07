import { describe, expect, it } from "vitest";
import type { CycleSummary } from "../../src/domain/types";
import {
  buildCalendarMarkers,
  buildCycleDayNumbers,
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

  it("marks the fertile window, ovulation, and a multi-day expected period", () => {
    const summary: CycleSummary = {
      cycleDay: 10,
      phaseLabel: "follicular",
      fertile: false,
      ovulationDate: "2026-04-14",
      nextPeriod: { date: "2026-04-28", daysUntil: 14 },
      cycleLength: 28,
      periodLength: 4,
      fertileWindow: { start: -5, end: 1 },
      estimateMode: "learned",
    };

    const markers = buildCalendarMarkers(
      summary,
      true,
      "2026-04-01",
      "2026-05-05",
    );

    // Fertile window spans ovulation-5 through ovulation+1, with ovulation
    // itself overriding the fertile marker on its own day.
    expect(markers.get("2026-04-09")).toBe("fertile");
    expect(markers.get("2026-04-14")).toBe("ovulation");
    expect(markers.get("2026-04-15")).toBe("fertile");
    // The expected period spans periodLength days from the next period start.
    expect(markers.get("2026-04-28")).toBe("predicted-period");
    expect(markers.get("2026-05-01")).toBe("predicted-period");
    expect(markers.has("2026-05-02")).toBe(false);
    expect(markers.has("2026-04-08")).toBe(false);
  });

  it("paints a retrospective fertile window for each past ovulation date", () => {
    const summary: CycleSummary = {
      cycleDay: 10,
      phaseLabel: "follicular",
      fertile: false,
      ovulationDate: "2026-04-14",
      nextPeriod: { date: "2026-04-28", daysUntil: 14 },
      cycleLength: 28,
      periodLength: 4,
      fertileWindow: { start: -5, end: 1 },
      estimateMode: "learned",
    };

    // A past cycle's ovulation on 2026-03-17 gets the same window as the
    // forecast: 03-12..03-18, ovulation on its own day.
    const markers = buildCalendarMarkers(
      summary,
      true,
      "2026-03-01",
      "2026-04-05",
      ["2026-03-17"],
    );

    expect(markers.get("2026-03-12")).toBe("fertile");
    expect(markers.get("2026-03-17")).toBe("ovulation");
    expect(markers.get("2026-03-18")).toBe("fertile");
    expect(markers.has("2026-03-11")).toBe(false);
  });

  it("omits retrospective fertile windows when fertility is hidden", () => {
    const summary: CycleSummary = {
      cycleDay: 10,
      phaseLabel: "follicular",
      fertile: false,
      ovulationDate: "2026-04-14",
      nextPeriod: { date: "2026-04-28", daysUntil: 14 },
      cycleLength: 28,
      periodLength: 4,
      fertileWindow: { start: -5, end: 1 },
      estimateMode: "learned",
    };

    const markers = buildCalendarMarkers(
      summary,
      false,
      "2026-03-01",
      "2026-04-05",
      ["2026-03-17"],
    );

    expect([...markers.values()].some((m) => m !== "predicted-period")).toBe(
      false,
    );
  });

  it("repeats the expected period every cycle across the window", () => {
    const summary: CycleSummary = {
      cycleDay: 10,
      phaseLabel: "follicular",
      fertile: false,
      ovulationDate: "2026-04-14",
      nextPeriod: { date: "2026-04-28", daysUntil: 14 },
      cycleLength: 28,
      periodLength: 4,
      fertileWindow: { start: -5, end: 1 },
      estimateMode: "learned",
    };

    // A window two cycles out still gets the forecast: 2026-04-28 + 2×28d.
    const markers = buildCalendarMarkers(
      summary,
      false,
      "2026-06-01",
      "2026-07-05",
    );

    expect(markers.get("2026-06-23")).toBe("predicted-period");
    expect(markers.get("2026-06-26")).toBe("predicted-period");
    // The next run starts a full cycle later.
    expect(markers.get("2026-07-21" as never)).toBeUndefined();
  });

  it("shows no expected period in months before it starts", () => {
    const summary: CycleSummary = {
      cycleDay: 10,
      phaseLabel: "follicular",
      fertile: false,
      ovulationDate: "2026-04-14",
      nextPeriod: { date: "2026-04-28", daysUntil: 14 },
      cycleLength: 28,
      periodLength: 4,
      fertileWindow: { start: -5, end: 1 },
      estimateMode: "learned",
    };

    const markers = buildCalendarMarkers(
      summary,
      false,
      "2026-02-01",
      "2026-03-08",
    );

    expect([...markers.values()].some((m) => m === "predicted-period")).toBe(
      false,
    );
  });

  it("drops fertility markers but keeps the expected period when hidden", () => {
    const summary: CycleSummary = {
      cycleDay: 10,
      phaseLabel: "follicular",
      fertile: false,
      ovulationDate: "2026-04-14",
      nextPeriod: { date: "2026-04-28", daysUntil: 14 },
      cycleLength: 28,
      periodLength: 4,
      fertileWindow: { start: -5, end: 1 },
      estimateMode: "learned",
    };

    const markers = buildCalendarMarkers(
      summary,
      false,
      "2026-04-01",
      "2026-05-05",
    );

    expect(markers.has("2026-04-14")).toBe(false);
    expect(markers.has("2026-04-09")).toBe(false);
    expect(markers.get("2026-04-28")).toBe("predicted-period");
  });

  it("numbers each day of the current cycle up to the next expected period", () => {
    // Cycle starts 2026-04-01 (nextPeriod - cycleLength); numbering stops before it.
    const summary: CycleSummary = {
      cycleDay: 10,
      phaseLabel: "follicular",
      fertile: false,
      ovulationDate: "2026-04-14",
      nextPeriod: { date: "2026-04-29", daysUntil: 19 },
      cycleLength: 28,
      periodLength: 4,
      fertileWindow: { start: -5, end: 1 },
      estimateMode: "learned",
    };

    const numbers = buildCycleDayNumbers(
      summary,
      "2026-04-10",
      "2026-04-01",
      "2026-05-05",
    );

    expect(numbers.get("2026-04-01")).toBe(1);
    expect(numbers.get("2026-04-10")).toBe(10);
    expect(numbers.get("2026-04-28")).toBe(28);
    // The next expected period is the next cycle's day 1, so it is not numbered.
    expect(numbers.has("2026-04-29")).toBe(false);
    // Days before the cycle start (outside the window's cycle) get nothing.
    expect(numbers.has("2026-03-31")).toBe(false);
  });

  it("keeps counting through today when the predicted period is overdue", () => {
    // Cycle started 2026-03-13; the predicted next period (day 29, 2026-04-10)
    // has already passed with no new log, so today is day 37.
    const summary: CycleSummary = {
      cycleDay: 37,
      phaseLabel: "luteal",
      fertile: false,
      ovulationDate: "2026-03-27",
      nextPeriod: { date: "2026-04-10", daysUntil: -8 },
      cycleLength: 28,
      periodLength: 4,
      fertileWindow: { start: -5, end: 1 },
      estimateMode: "learned",
    };

    const numbers = buildCycleDayNumbers(
      summary,
      "2026-04-18",
      "2026-03-01",
      "2026-05-05",
    );

    // The overdue predicted start and today both keep a running number.
    expect(numbers.get("2026-04-10")).toBe(29);
    expect(numbers.get("2026-04-18")).toBe(37);
    // Nothing past today.
    expect(numbers.has("2026-04-19")).toBe(false);
  });

  it("produces no cycle-day numbers before a cycle can be estimated", () => {
    const summary: CycleSummary = {
      cycleDay: null,
      phaseLabel: "unknown",
      fertile: false,
      ovulationDate: null,
      nextPeriod: { date: null, daysUntil: null },
      cycleLength: 28,
      periodLength: 5,
      fertileWindow: { start: -5, end: 1 },
      estimateMode: "insufficient",
    };

    expect(
      buildCycleDayNumbers(summary, "2026-04-18", "2026-04-01", "2026-05-05")
        .size,
    ).toBe(0);
  });

  it("produces no markers before a cycle can be estimated", () => {
    const summary: CycleSummary = {
      cycleDay: null,
      phaseLabel: "unknown",
      fertile: false,
      ovulationDate: null,
      nextPeriod: { date: null, daysUntil: null },
      cycleLength: 28,
      periodLength: 5,
      fertileWindow: { start: -5, end: 1 },
      estimateMode: "insufficient",
    };

    expect(
      buildCalendarMarkers(summary, true, "2026-04-01", "2026-05-05").size,
    ).toBe(0);
  });
});
