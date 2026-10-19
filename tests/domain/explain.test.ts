import { describe, expect, it } from "vitest";
import {
  explainForecast,
  forecast,
  getExpectedCycles,
} from "../../src/domain/cycle";
import { startsEndingOn } from "../support/cycles";

const TODAY = "2026-04-09";

describe("explainForecast", () => {
  it("shows the last six cycle lengths, their median, spread and range", () => {
    // Seven cycles: the oldest (40) falls outside the six-cycle window.
    const periodDays = startsEndingOn(
      "2026-04-01",
      [40, 27, 30, 28, 29, 31, 26],
    );
    const f = forecast({ today: TODAY, periodDays, fertility: false });

    const explained = explainForecast(f);

    expect(explained).toMatchObject({
      cycleLengths: [27, 30, 28, 29, 31, 26],
      median: 28.5,
      cycleLength: 29,
      lastStart: "2026-04-01",
      nextPeriod: "2026-04-30",
      spreadDays: 1.7,
      // ± ceil(1.7) = 2 days
      range: { from: "2026-04-28", to: "2026-05-02" },
      fertility: null,
    });
  });

  it("explains the fertile window, widened by the spread, when fertility is on", () => {
    // Lengths 24 and 32: standard deviation 4, so the window widens by 4.
    const periodDays = startsEndingOn("2026-04-01", [24, 32]);
    const f = forecast({ today: TODAY, periodDays, fertility: true });

    expect(explainForecast(f)?.fertility).toEqual({
      ovulation: "2026-04-15",
      lutealDays: 14,
      from: "2026-04-06",
      to: "2026-04-20",
      daysBefore: 9,
      daysAfter: 5,
      widening: 4,
    });
  });

  it("names the 28-day default and gives no range before a full cycle", () => {
    const f = forecast({
      today: TODAY,
      periodDays: ["2026-04-01"],
      fertility: false,
    });

    expect(explainForecast(f)).toMatchObject({
      cycleLengths: [],
      median: null,
      cycleLength: 28,
      nextPeriod: "2026-04-29",
      spreadDays: null,
      range: null,
    });
  });

  it("gives no range when every recent cycle was the same length", () => {
    const periodDays = startsEndingOn("2026-04-01", [28, 28]);
    const f = forecast({ today: TODAY, periodDays, fertility: false });

    expect(explainForecast(f)).toMatchObject({ spreadDays: 0, range: null });
  });

  it("has nothing to explain without a forecast", () => {
    expect(
      explainForecast(
        forecast({ today: TODAY, periodDays: [], fertility: true }),
      ),
    ).toBeNull();
  });
});

describe("getExpectedCycles", () => {
  it("lists the next expected starts with stable cycle numbers", () => {
    const periodDays = startsEndingOn("2026-04-01", [28, 28]);
    const f = forecast({ today: TODAY, periodDays, fertility: false });

    expect(getExpectedCycles(f, TODAY, 3)).toEqual([
      {
        number: 4,
        periodStart: "2026-04-29",
        fertileFrom: "2026-04-10",
        fertileTo: "2026-04-16",
      },
      {
        number: 5,
        periodStart: "2026-05-27",
        fertileFrom: "2026-05-08",
        fertileTo: "2026-05-14",
      },
      {
        number: 6,
        periodStart: "2026-06-24",
        fertileFrom: "2026-06-05",
        fertileTo: "2026-06-11",
      },
    ]);
  });

  it("skips a start that is already overdue, keeping the numbers", () => {
    const periodDays = startsEndingOn("2026-03-01", [28]);
    // Next period 03-29 is 5 days late on 04-03.
    const f = forecast({ today: "2026-04-03", periodDays, fertility: false });

    const cycles = getExpectedCycles(f, "2026-04-03", 2);

    expect(cycles.map((c) => [c.number, c.periodStart])).toEqual([
      [4, "2026-04-26"],
      [5, "2026-05-24"],
    ]);
  });

  it("keeps the numbers of the cycles still ahead once a period is logged", () => {
    const periodDays = startsEndingOn("2026-04-01", [28, 28]);
    const before = getExpectedCycles(
      forecast({ today: TODAY, periodDays, fertility: false }),
      TODAY,
      3,
    );
    // The period expected on 04-29 comes two days late.
    const later = "2026-05-02";
    const after = getExpectedCycles(
      forecast({
        today: later,
        periodDays: [...periodDays, "2026-05-01", "2026-05-02"],
        fertility: false,
      }),
      later,
      2,
    );

    // The same cycles keep their numbers, so a newer file moves them.
    expect(after.map((c) => c.number)).toEqual(
      before.slice(1).map((c) => c.number),
    );
    expect(after.map((c) => c.periodStart)).toEqual([
      "2026-05-29",
      "2026-06-26",
    ]);
    expect(before.slice(1).map((c) => c.periodStart)).toEqual([
      "2026-05-27",
      "2026-06-24",
    ]);
  });

  it("is empty without a forecast", () => {
    const f = forecast({ today: TODAY, periodDays: [], fertility: false });
    expect(getExpectedCycles(f, TODAY, 3)).toEqual([]);
  });
});
