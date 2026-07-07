import { describe, expect, it } from "vitest";
import {
  buildCycleSummary,
  getAveragePeriodLength,
  getCompletedCycleLengths,
  getPeriodDayNumbers,
} from "../../src/domain/cycle";

describe("getPeriodDayNumbers", () => {
  it("counts calendar days since the period start, so skipped days still count and a new period resets", () => {
    const numbers = getPeriodDayNumbers([
      "2026-06-01",
      "2026-06-05", // gap of 4 -> same period, calendar day 5
      "2026-06-29", // gap of 24 -> new period, day 1
      "2026-06-30",
    ]);

    expect(numbers.get("2026-06-01")).toBe(1);
    expect(numbers.get("2026-06-05")).toBe(5);
    expect(numbers.get("2026-06-29")).toBe(1);
    expect(numbers.get("2026-06-30")).toBe(2);
  });
});

describe("getCompletedCycleLengths", () => {
  it("ignores gaps from missed logging days when computing completed cycle lengths", () => {
    expect(
      getCompletedCycleLengths([
        "2026-06-01",
        "2026-06-02",
        "2026-06-04",
        "2026-06-05",
        "2026-06-29",
        "2026-06-30",
      ]),
    ).toEqual([28]);
  });
});

describe("getAveragePeriodLength", () => {
  it("defaults to 4 with no data and averages completed periods", () => {
    expect(getAveragePeriodLength([])).toBe(4);

    // Two completed 4-day periods + an ongoing 1-day period (dropped): avg 4.
    expect(
      getAveragePeriodLength([
        "2026-01-01",
        "2026-01-02",
        "2026-01-03",
        "2026-01-04",
        "2026-01-29",
        "2026-01-30",
        "2026-01-31",
        "2026-02-01",
        "2026-02-26", // ongoing, dropped from the average
      ]),
    ).toBe(4);
  });

  it("clamps to ACOG's 2–7 day normal band", () => {
    // A single 9-day run would average 9; clamp to 7.
    expect(
      getAveragePeriodLength([
        "2026-03-01",
        "2026-03-02",
        "2026-03-03",
        "2026-03-04",
        "2026-03-05",
        "2026-03-06",
        "2026-03-07",
        "2026-03-08",
        "2026-03-09",
      ]),
    ).toBe(7);

    // Two 1-day periods average 1; clamp up to 2.
    expect(getAveragePeriodLength(["2026-01-01", "2026-02-01"])).toBe(2);
  });
});

describe("buildCycleSummary", () => {
  it("does not treat a missed logging day inside a period as a new cycle start", () => {
    const periodDays = [
      "2026-06-01",
      "2026-06-02",
      "2026-06-04",
      "2026-06-05",
    ] as const;
    const summary = buildCycleSummary({
      today: "2026-06-10",
      periodDays: [...periodDays],
      completedCycleLengths: getCompletedCycleLengths([...periodDays]),
    });

    expect(summary.cycleDay).toBe(10);
    expect(summary.estimateMode).toBe("fallback");
    expect(summary.nextPeriod.date).toBe("2026-06-29");
  });

  it("uses a 28-day fallback cycle model when only one cycle start exists", () => {
    const summary = buildCycleSummary({
      today: "2026-04-19",
      periodDays: ["2026-04-19", "2026-04-20"],
      completedCycleLengths: [],
    });

    expect(summary.cycleDay).toBe(1);
    expect(summary.nextPeriod.date).toBe("2026-05-17");
    expect(summary.ovulationDate).toBe("2026-05-03");
    expect(summary.phaseLabel).toBe("menstrual");
    expect(summary.estimateMode).toBe("fallback");
  });

  it("calculates the current cycle day from the most recent cycle start", () => {
    const summary = buildCycleSummary({
      today: "2026-04-18",
      periodDays: ["2026-03-20", "2026-03-21", "2026-04-02", "2026-04-03"],
      completedCycleLengths: [28, 29, 27],
    });

    expect(summary.cycleDay).toBe(17);
  });

  it("shows the next period as an estimate in X days", () => {
    const summary = buildCycleSummary({
      today: "2026-04-18",
      periodDays: ["2026-03-20", "2026-03-21", "2026-04-02", "2026-04-03"],
      completedCycleLengths: [28, 29, 27],
    });

    expect(summary.nextPeriod.date).toBe("2026-04-30");
    expect(summary.nextPeriod.daysUntil).toBe(12);
  });

  it("returns limited predictions when there is not enough history", () => {
    const summary = buildCycleSummary({
      today: "2026-04-18",
      periodDays: [],
      completedCycleLengths: [],
    });

    expect(summary.phaseLabel).toBe("unknown");
    expect(summary.nextPeriod.daysUntil).toBeNull();
    expect(summary.estimateMode).toBe("insufficient");
  });

  it("uses the four user-facing phase names", () => {
    const summary = buildCycleSummary({
      today: "2026-04-18",
      periodDays: ["2026-03-05", "2026-03-06", "2026-04-02", "2026-04-03"],
      completedCycleLengths: [28],
    });

    expect(["menstrual", "follicular", "ovulation", "luteal"]).toContain(
      summary.phaseLabel,
    );
  });
});
