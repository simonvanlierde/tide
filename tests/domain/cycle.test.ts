import { describe, expect, it } from "vitest";
import { buildCycleSummary } from "../../src/domain/cycle";

describe("buildCycleSummary", () => {
  it("calculates the current cycle day from the most recent cycle start", () => {
    const summary = buildCycleSummary({
      today: "2026-04-18",
      periodDays: ["2026-03-20", "2026-03-21", "2026-04-02", "2026-04-03"],
      completedCycleLengths: [28, 29, 27]
    });

    expect(summary.cycleDay).toBe(17);
  });

  it("shows the next period as an estimate in X days", () => {
    const summary = buildCycleSummary({
      today: "2026-04-18",
      periodDays: ["2026-03-20", "2026-03-21", "2026-04-02", "2026-04-03"],
      completedCycleLengths: [28, 29, 27]
    });

    expect(summary.nextPeriod.date).toBe("2026-04-30");
    expect(summary.nextPeriod.daysUntil).toBe(12);
  });

  it("returns limited predictions when there is not enough history", () => {
    const summary = buildCycleSummary({
      today: "2026-04-18",
      periodDays: ["2026-04-02", "2026-04-03"],
      completedCycleLengths: []
    });

    expect(summary.phaseLabel).toBe("unknown");
    expect(summary.nextPeriod.daysUntil).toBeNull();
  });
});
