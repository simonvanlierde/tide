import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addDays,
  addMonths,
  differenceInDays,
  getTodayIsoDate,
  getWeekdayLabels,
} from "../../src/utils/date";

describe("date arithmetic", () => {
  it("adds days across month, year and leap-day boundaries", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2025-12-31", 1)).toBe("2026-01-01");
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("adds months by snapping to the first, so month-end never rolls over", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-01");
    expect(addMonths("2026-12-15", 1)).toBe("2027-01-01");
    expect(addMonths("2026-01-15", -1)).toBe("2025-12-01");
  });

  it("counts whole days regardless of DST or local timezone", () => {
    expect(differenceInDays("2026-03-30", "2026-03-28")).toBe(2); // EU DST
    expect(differenceInDays("2026-01-01", "2025-12-31")).toBe(1);
    expect(differenceInDays("2024-03-01", "2024-02-01")).toBe(29);
  });

  it("starts the week header on Monday", () => {
    expect(getWeekdayLabels("en-US")[0]).toBe("Mon");
  });
});

describe("getTodayIsoDate", () => {
  afterEach(() => vi.useRealTimers());

  it("uses the local calendar day, not the UTC one", () => {
    vi.useFakeTimers();
    // 23:30 local on the 14th; in any zone east of UTC-0:30 the UTC date differs.
    vi.setSystemTime(new Date(2026, 5, 14, 23, 30));
    expect(getTodayIsoDate()).toBe("2026-06-14");
  });
});
