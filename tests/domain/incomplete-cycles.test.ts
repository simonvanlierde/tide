import { describe, expect, it } from "vitest";
import { forecast, getCycleHistory, getExpectedCycles } from "../../src/domain/cycle";
import type { IsoDate } from "../../src/domain/types";

const starts: IsoDate[] = ["2026-01-01", "2026-01-29", "2026-03-26", "2026-04-23"];

describe("incomplete cycle history", () => {
  it("keeps every interval and marks the excluded one without bridging it", () => {
    expect(getCycleHistory(starts, ["2026-01-29"])).toEqual([
      { start: "2026-01-01", end: "2026-01-29", length: 28, incomplete: false },
      { start: "2026-01-29", end: "2026-03-26", length: 56, incomplete: true },
      { start: "2026-03-26", end: "2026-04-23", length: 28, incomplete: false },
    ]);
  });

  it("excludes incomplete lengths and past windows but keeps the current anchor", () => {
    const result = forecast({
      today: "2026-04-25",
      periodDays: starts,
      fertility: true,
      incompleteCycleStarts: ["2026-01-29"],
    });
    expect(result.stats).toEqual({ cyclesTracked: 2, recentCycleLengths: [28, 28], variabilityDays: 0 });
    expect(result.cycleStart).toBe("2026-04-23");
    expect(result.nextPeriod.date).toBe("2026-05-21");
    expect(result.dayInfo("2026-03-12").estimate).toBeNull();
    expect(result.dayInfo("2026-04-09").estimate).toBe("ovulation");
  });

  it("ignores future starts and falls back when all completed cycles are incomplete", () => {
    const result = forecast({
      today: "2026-02-01",
      periodDays: starts,
      fertility: true,
      incompleteCycleStarts: ["2026-01-01"],
    });
    expect(result.stats.cyclesTracked).toBe(0);
    expect(result.estimateMode).toBe("fallback");
    expect(result.cycleStart).toBe("2026-01-29");
    expect(result.nextPeriod.date).toBe("2026-02-26");
  });
});

it("keeps calendar event numbers stable when a cycle is excluded", () => {
  const input = {
    today: "2026-02-26" as const,
    periodDays: ["2026-01-01", "2026-01-29", "2026-02-26"] as import("../../src/domain/types").IsoDate[],
    fertility: true,
  };
  const before = getExpectedCycles(forecast(input), input.today, 3);
  const after = getExpectedCycles(forecast({ ...input, incompleteCycleStarts: ["2026-01-01"] }), input.today, 3);
  expect(after).toEqual(before);
});
