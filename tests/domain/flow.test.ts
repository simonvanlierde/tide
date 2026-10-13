import { describe, expect, it } from "vitest";
import { getPeriodRange, MAX_PERIOD_RANGE_DAYS } from "../../src/domain/flow";
import { addDays } from "../../src/utils/date";

describe("getPeriodRange", () => {
  it("lists every day from the first to the last, in either order", () => {
    const days = ["2026-03-30", "2026-03-31", "2026-04-01", "2026-04-02"];
    expect(getPeriodRange("2026-03-30", "2026-04-02")).toEqual(days);
    expect(getPeriodRange("2026-04-02", "2026-03-30")).toEqual(days);
    expect(getPeriodRange("2026-04-02", "2026-04-02")).toEqual(["2026-04-02"]);
  });

  it("refuses a run longer than the cap", () => {
    const start = "2026-04-01";
    expect(
      getPeriodRange(start, addDays(start, MAX_PERIOD_RANGE_DAYS - 1)),
    ).toHaveLength(MAX_PERIOD_RANGE_DAYS);
    expect(
      getPeriodRange(start, addDays(start, MAX_PERIOD_RANGE_DAYS)),
    ).toBeNull();
  });
});
