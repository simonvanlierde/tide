import { describe, expect, it } from "vitest";
import {
  buildCycleSummary,
  getAveragePeriodLength,
  getCompletedCycleLengths,
  getCycleStats,
  getPastOvulationDates,
  getPeriodDayNumbers,
} from "../../src/domain/cycle";
import type { IsoDate } from "../../src/domain/types";

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

describe("getPastOvulationDates", () => {
  it("estimates ovulation 14 days before each following period start, one per completed cycle", () => {
    // Two completed cycles: starts on 06-01, 06-29, 07-27. The last start is the
    // in-progress cycle and has no following start, so it yields no ovulation.
    expect(
      getPastOvulationDates([
        "2026-06-01",
        "2026-06-02",
        "2026-06-29",
        "2026-06-30",
        "2026-07-27",
      ]),
    ).toEqual(["2026-06-15", "2026-07-13"]);
  });

  it("returns nothing until at least one cycle has completed", () => {
    expect(getPastOvulationDates([])).toEqual([]);
    expect(getPastOvulationDates(["2026-06-01", "2026-06-02"])).toEqual([]);
  });
});

describe("getAveragePeriodLength", () => {
  it("defaults to 4 with no data and averages completed periods", () => {
    expect(getAveragePeriodLength([], "2026-03-01")).toBe(4);

    // Two completed 4-day periods + a last 1-day run that's still recent
    // (dropped as possibly ongoing): avg 4. today is 1 day after the last log.
    expect(
      getAveragePeriodLength(
        [
          "2026-01-01",
          "2026-01-02",
          "2026-01-03",
          "2026-01-04",
          "2026-01-29",
          "2026-01-30",
          "2026-01-31",
          "2026-02-01",
          "2026-02-26", // still-recent last run, dropped from the average
        ],
        "2026-02-27",
      ),
    ).toBe(4);
  });

  it("counts the last run once it's finished (≥5 bleeding-free days)", () => {
    // A 5-day then a 3-day period, last log 15 days ago: last run is over, so
    // both count → avg 4. (The old rule dropped the last run and returned 5.)
    expect(
      getAveragePeriodLength(
        [
          "2026-01-01",
          "2026-01-02",
          "2026-01-03",
          "2026-01-04",
          "2026-01-05",
          "2026-02-01",
          "2026-02-02",
          "2026-02-03",
        ],
        "2026-02-18",
      ),
    ).toBe(4);
  });

  it("clamps to ACOG's 2–7 day normal band", () => {
    // A single 9-day run would average 9; clamp to 7.
    expect(
      getAveragePeriodLength(
        [
          "2026-03-01",
          "2026-03-02",
          "2026-03-03",
          "2026-03-04",
          "2026-03-05",
          "2026-03-06",
          "2026-03-07",
          "2026-03-08",
          "2026-03-09",
        ],
        "2026-04-01",
      ),
    ).toBe(7);

    // Two 1-day periods average 1; clamp up to 2.
    expect(
      getAveragePeriodLength(["2026-01-01", "2026-02-01"], "2026-03-01"),
    ).toBe(2);
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

  it("resists an outlier cycle via the median and widens the fertile window when irregular", () => {
    // 45 is an anomalous cycle (illness/travel). A flat mean would drag the
    // estimate to ~31; the median holds at 28.
    const summary = buildCycleSummary({
      today: "2026-04-04",
      periodDays: ["2026-04-02", "2026-04-03"],
      completedCycleLengths: [27, 28, 45, 28, 29],
    });

    expect(summary.cycleLength).toBe(28);
    // Spread from the outlier widens the −5/+1 base window (capped at ±5).
    expect(summary.fertileWindow.start).toBeLessThan(-5);
    expect(summary.fertileWindow.end).toBeGreaterThan(1);
    expect(summary.fertileWindow.start).toBeGreaterThanOrEqual(-10);
  });

  it("keeps the tight biological fertile window for a regular cycler", () => {
    const summary = buildCycleSummary({
      today: "2026-04-04",
      periodDays: ["2026-04-02", "2026-04-03"],
      completedCycleLengths: [28, 28, 28, 28],
    });

    expect(summary.fertileWindow).toEqual({ start: -5, end: 1 });
  });

  it("keeps the tight window for sub-day cycle jitter (regression: 27–29 day cycles are regular)", () => {
    // Three ~monthly periods whose starts fall 29/27/28 days apart: SD ≈ 0.8 day.
    // That is a regular cycler and must not widen past the 7-day biological base.
    const periodDays: IsoDate[] = [
      "2026-03-31",
      "2026-04-01",
      "2026-04-02",
      "2026-04-29",
      "2026-04-30",
      "2026-05-01",
      "2026-05-26",
      "2026-05-27",
      "2026-05-28",
      "2026-06-23",
      "2026-06-24",
      "2026-06-25",
    ];
    expect(getCompletedCycleLengths(periodDays)).toEqual([29, 27, 28]);

    const summary = buildCycleSummary({
      today: "2026-06-24",
      periodDays,
      completedCycleLengths: getCompletedCycleLengths(periodDays),
    });

    expect(summary.fertileWindow).toEqual({ start: -5, end: 1 });
  });

  it("widens by a whole day only once cycle-length spread reaches a full day", () => {
    // Cycles 26/28/30 days apart: SD ≈ 1.6 days -> one day of widening each side.
    const summary = buildCycleSummary({
      today: "2026-04-04",
      periodDays: ["2026-04-02", "2026-04-03"],
      completedCycleLengths: [26, 28, 30],
    });

    expect(summary.fertileWindow).toEqual({ start: -6, end: 2 });
  });

  it("only counts recent cycles, dropping stale history beyond the window", () => {
    // Six recent 30-day cycles; a run of old 21-day cycles should not pull the
    // estimate down once they fall outside the recency window.
    const summary = buildCycleSummary({
      today: "2026-04-04",
      periodDays: ["2026-04-02", "2026-04-03"],
      completedCycleLengths: [21, 21, 21, 30, 30, 30, 30, 30, 30],
    });

    expect(summary.cycleLength).toBe(30);
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

describe("getCycleStats", () => {
  it("reports no variability until two cycles exist, then the recent spread", () => {
    // One completed cycle: cyclesTracked 1, nothing to compare yet.
    const one = getCycleStats(["2026-01-01", "2026-01-29"]);
    expect(one.cyclesTracked).toBe(1);
    expect(one.variabilityDays).toBeNull();

    // Three cycle starts 28/30 days apart -> two completed cycles [28, 30],
    // with a small non-zero spread. (Cycle length itself lives on the summary.)
    const many = getCycleStats(["2026-01-01", "2026-01-29", "2026-02-28"]);
    expect(many.cyclesTracked).toBe(2);
    expect(many.variabilityDays).toBeGreaterThan(0);
  });

  it("reports no tracked cycles with no completed cycles", () => {
    expect(getCycleStats([]).cyclesTracked).toBe(0);
    expect(getCycleStats([]).variabilityDays).toBeNull();
  });
});
