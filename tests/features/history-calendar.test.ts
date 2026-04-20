import { describe, expect, it } from "vitest";
import {
  buildMonthDays,
  getHistoryYearOptions,
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

  it("returns a full year range from 2020 through the current year", () => {
    expect(getHistoryYearOptions("2026-04-18", [])).toEqual([
      2020, 2021, 2022, 2023, 2024, 2025, 2026,
    ]);
  });
});
