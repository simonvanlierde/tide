import { describe, expect, it } from "vitest";
import {
  buildMonthDays,
  getHistoryYearOptions,
} from "../../src/features/history/calendar";

describe("history calendar helpers", () => {
  it("builds a month grid with leading blanks and trailing fill cells", () => {
    const days = buildMonthDays("2026-04-18");

    expect(days).toHaveLength(35);
    expect(days[0]).toEqual({
      key: "blank-2026-4-1",
      value: null,
    });
    expect(days[2]?.value).toBe("2026-04-01");
    expect(days[34]?.value).toBe(null);
  });

  it("returns unique sorted year options from today and logged days", () => {
    expect(
      getHistoryYearOptions("2026-04-18", [
        "2025-03-10",
        "2026-04-20",
        "2024-12-03",
        "2025-07-01",
      ]),
    ).toEqual([2024, 2025, 2026]);
  });
});
