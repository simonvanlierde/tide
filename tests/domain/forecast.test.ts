import { afterEach, describe, expect, it, vi } from "vitest";
import { forecast } from "../../src/domain/cycle";
import type { IsoDate } from "../../src/domain/types";
import { addDays } from "../../src/utils/date";
import { startsEndingOn } from "../support/cycles";

// A period of `length` days from each start.
function periods(starts: IsoDate[], length: number): IsoDate[] {
  return starts.flatMap((start) =>
    Array.from({ length }, (_, offset) => addDays(start, offset)),
  );
}

function datesFrom(from: IsoDate, to: IsoDate): IsoDate[] {
  const dates: IsoDate[] = [];
  for (let day = from; day <= to; day = addDays(day, 1)) {
    dates.push(day);
  }
  return dates;
}

// One completed 28-day cycle (03-03 → 03-31) of 4-day periods; today is cycle
// day 10. Next period 04-28, ovulation 04-14, and the past cycle's ovulation
// 03-17.
const LEARNED = forecast({
  today: "2026-04-09",
  periodDays: periods(["2026-03-03", "2026-03-31"], 4),
});

// Same rhythm a cycle earlier, but today is 8 days past the 04-10 forecast.
const OVERDUE = forecast({
  today: "2026-04-18",
  periodDays: periods(["2026-02-13", "2026-03-13"], 4),
});

describe("forecast timeline", () => {
  it("matches the summary it extends", () => {
    expect(LEARNED).toMatchObject({
      cycleDay: 10,
      ovulationDate: "2026-04-14",
      nextPeriod: { date: "2026-04-28", daysUntil: 19 },
      cycleLength: 28,
      periodLength: 4,
      fertileWindow: { start: -5, end: 1 },
      estimateMode: "learned",
      cycleStart: "2026-03-31",
      cycleEnd: "2026-04-27",
      stats: { cyclesTracked: 1, variabilityDays: null },
    });
  });

  it("marks the fertile window, ovulation, and a multi-day expected period", () => {
    const estimate = (date: IsoDate) => LEARNED.dayInfo(date).estimate;

    // Fertile window spans ovulation-5 through ovulation+1, with ovulation
    // itself overriding the fertile marker on its own day.
    expect(estimate("2026-04-09")).toBe("fertile");
    expect(estimate("2026-04-14")).toBe("ovulation");
    expect(estimate("2026-04-15")).toBe("fertile");
    // The expected period spans periodLength days from the next period start.
    expect(estimate("2026-04-28")).toBe("predicted-period");
    expect(estimate("2026-05-01")).toBe("predicted-period");
    expect(estimate("2026-05-02")).toBeNull();
    expect(estimate("2026-04-08")).toBeNull();
  });

  it("gives each completed past cycle a retrospective fertile window", () => {
    const estimate = (date: IsoDate) => LEARNED.dayInfo(date).estimate;

    // The past cycle's ovulation on 03-17 gets the same window as the
    // forecast: 03-12..03-18, ovulation on its own day.
    expect(estimate("2026-03-12")).toBe("fertile");
    expect(estimate("2026-03-17")).toBe("ovulation");
    expect(estimate("2026-03-18")).toBe("fertile");
    expect(estimate("2026-03-11")).toBeNull();
  });

  it("repeats the expected period every cycle into the future", () => {
    const estimate = (date: IsoDate) => LEARNED.dayInfo(date).estimate;

    // Two cycles out: 04-28 + 2×28 days.
    expect(estimate("2026-06-23")).toBe("predicted-period");
    expect(estimate("2026-06-26")).toBe("predicted-period");
    expect(estimate("2026-06-27")).toBeNull();
    // The next run starts a full cycle later.
    expect(estimate("2026-07-21")).toBe("predicted-period");
  });

  it("repeats a short learned cycle every cycleLength days, not 28", () => {
    const short = forecast({
      today: "2026-06-06",
      periodDays: [...startsEndingOn("2026-06-01", [24, 24, 25]), "2026-06-02"],
    });

    expect(short.cycleLength).toBe(24);
    expect(short.dayInfo("2026-06-25").estimate).toBe("predicted-period");
    expect(short.dayInfo("2026-07-19").estimate).toBe("predicted-period");
    // 06-25 + 28 days would be the 28-day case.
    expect(short.dayInfo("2026-07-23").estimate).toBeNull();
  });

  it("paints the overdue expected period on its past dates without rolling forward", () => {
    const estimate = (date: IsoDate) => OVERDUE.dayInfo(date).estimate;

    expect(OVERDUE.nextPeriod).toEqual({ date: "2026-04-10", daysUntil: -8 });
    expect(estimate("2026-04-10")).toBe("predicted-period");
    expect(estimate("2026-04-13")).toBe("predicted-period");
    expect(estimate("2026-04-14")).toBeNull();
    expect(estimate("2026-04-09")).toBeNull();
  });

  it("shows no expected period before the next one is due", () => {
    expect(
      datesFrom("2026-02-01", "2026-04-27").some(
        (date) => LEARNED.dayInfo(date).estimate === "predicted-period",
      ),
    ).toBe(false);
  });

  it("numbers each day of the current cycle up to the next expected period", () => {
    const cycleDay = (date: IsoDate) => LEARNED.dayInfo(date).cycleDay;

    expect(cycleDay("2026-03-31")).toBe(1);
    expect(cycleDay("2026-04-09")).toBe(10);
    expect(cycleDay("2026-04-27")).toBe(28);
    // The next expected period is the next cycle's day 1, so it is not numbered.
    expect(cycleDay("2026-04-28")).toBeNull();
    // Days before the cycle start get nothing.
    expect(cycleDay("2026-03-30")).toBeNull();
  });

  it("keeps counting through today when the predicted period is overdue", () => {
    const cycleDay = (date: IsoDate) => OVERDUE.dayInfo(date).cycleDay;

    expect(OVERDUE.cycleEnd).toBe("2026-04-18");
    expect(cycleDay("2026-04-10")).toBe(29);
    expect(cycleDay("2026-04-18")).toBe(37);
    expect(cycleDay("2026-04-19")).toBeNull();
  });

  it("knows nothing about any day without history", () => {
    const empty = forecast({ today: "2026-04-18", periodDays: [] });

    expect(empty).toMatchObject({
      estimateMode: "insufficient",
      cycleStart: null,
      cycleEnd: null,
      stats: { cyclesTracked: 0, variabilityDays: null },
    });
    expect(
      datesFrom("2026-04-01", "2026-05-05").every((date) => {
        const info = empty.dayInfo(date);
        return info.cycleDay === null && info.estimate === null;
      }),
    ).toBe(true);
  });

  it("falls back to a 28-day cycle from a single period", () => {
    const one = forecast({
      today: "2026-04-21",
      periodDays: periods(["2026-04-19"], 3),
    });

    expect(one.estimateMode).toBe("fallback");
    expect(one.cycleStart).toBe("2026-04-19");
    expect(one.cycleEnd).toBe("2026-05-16");
    expect(one.dayInfo("2026-05-16").cycleDay).toBe(28);
    expect(one.dayInfo("2026-05-17").estimate).toBe("predicted-period");
    expect(one.dayInfo("2026-05-03").estimate).toBe("ovulation");
    // No completed cycle yet, so no retrospective window before it.
    expect(one.dayInfo("2026-04-05").estimate).toBeNull();
  });

  it("learns from one completed cycle", () => {
    const one = forecast({
      today: "2026-04-25",
      periodDays: periods(["2026-03-27", "2026-04-22"], 2),
    });

    expect(one.estimateMode).toBe("learned");
    expect(one.cycleLength).toBe(26);
    expect(one.nextPeriod.date).toBe("2026-05-18");
    expect(one.dayInfo("2026-04-08").estimate).toBe("ovulation");
  });

  it("uses the median of the last six cycles for the timeline", () => {
    // Older 40-day cycles fall outside the window; the last six median to 29.5,
    // rounded to 30.
    const windowed = forecast({
      today: "2026-06-03",
      periodDays: startsEndingOn(
        "2026-06-01",
        [40, 40, 27, 28, 29, 30, 31, 45],
      ),
    });

    expect(windowed.cycleLength).toBe(30);
    expect(windowed.cycleEnd).toBe("2026-06-30");
    expect(windowed.dayInfo("2026-07-01").estimate).toBe("predicted-period");
    expect(windowed.dayInfo("2026-07-31").estimate).toBe("predicted-period");
  });

  it("keeps the estimate on a logged future day, which it ignores", () => {
    // The calendar is what hides estimates under logged days.
    const future = forecast({
      today: "2026-04-09",
      periodDays: [...periods(["2026-03-03", "2026-03-31"], 4), "2026-04-28"],
    });

    expect(future.nextPeriod.date).toBe("2026-04-28");
    expect(future.dayInfo("2026-04-28").estimate).toBe("predicted-period");
  });

  it("drops a stale forecast but keeps past fertile windows", () => {
    const stale = forecast({
      today: "2026-08-22",
      periodDays: ["2026-06-04", "2026-07-02", "2026-07-03"],
    });

    expect(stale.estimateMode).toBe("insufficient");
    expect(stale.cycleStart).toBeNull();
    expect(stale.dayInfo("2026-06-18").estimate).toBe("ovulation");
    expect(stale.dayInfo("2026-07-30").estimate).toBeNull();
    expect(stale.dayInfo("2026-07-10").cycleDay).toBeNull();
  });
});

describe("forecast across calendar boundaries", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("counts whole days across a daylight-saving change", () => {
    // Europe/Amsterdam moves the clocks forward on 2026-03-29 and back on
    // 2026-10-25; a 23- or 25-hour day must still count as one.
    vi.stubEnv("TZ", "Europe/Amsterdam");
    const spring = forecast({
      today: "2026-04-05",
      periodDays: periods(["2026-02-23", "2026-03-23"], 3),
    });
    expect(spring.cycleLength).toBe(28);
    expect(spring.dayInfo("2026-03-29").cycleDay).toBe(7);
    expect(spring.dayInfo("2026-03-30").cycleDay).toBe(8);

    const autumn = forecast({
      today: "2026-10-28",
      periodDays: periods(["2026-09-22", "2026-10-20"], 3),
    });
    expect(autumn.dayInfo("2026-10-25").cycleDay).toBe(6);
    expect(autumn.dayInfo("2026-10-26").cycleDay).toBe(7);
    expect(autumn.nextPeriod.date).toBe("2026-11-17");
  });

  it("runs the timeline over month ends and a leap day", () => {
    const leap = forecast({
      today: "2028-01-20",
      periodDays: periods(["2027-12-08", "2028-01-05"], 4),
    });

    expect(leap.cycleEnd).toBe("2028-02-01");
    expect(leap.nextPeriod.date).toBe("2028-02-02");
    expect(leap.dayInfo("2028-01-31").cycleDay).toBe(27);
    expect(leap.dayInfo("2028-02-01").cycleDay).toBe(28);
    // The run after next lands across the leap day: 03-01 is 02-02 + 28.
    expect(leap.dayInfo("2028-02-29").estimate).toBeNull();
    expect(leap.dayInfo("2028-03-01").estimate).toBe("predicted-period");
    expect(leap.dayInfo("2028-03-04").estimate).toBe("predicted-period");
  });
});
