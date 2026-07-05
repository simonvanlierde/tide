import { describe, expect, it } from "vitest";
import { dayIndexFromPoint } from "../../src/features/today/CycleDial";

describe("dayIndexFromPoint", () => {
  const rect = { left: 0, top: 0, width: 280, height: 280 };
  const totalDays = 28;

  it("maps the 12 o'clock position to day 1", () => {
    expect(dayIndexFromPoint(140, 0, rect, totalDays)).toBe(0);
  });

  it("maps quarter turns to the matching day", () => {
    expect(dayIndexFromPoint(280, 140, rect, totalDays)).toBe(7); // 3 o'clock
    expect(dayIndexFromPoint(140, 280, rect, totalDays)).toBe(14); // 6 o'clock
    expect(dayIndexFromPoint(0, 140, rect, totalDays)).toBe(21); // 9 o'clock
  });

  it("clamps just left of 12 o'clock to the last day", () => {
    expect(dayIndexFromPoint(139, 0, rect, totalDays)).toBe(totalDays - 1);
  });
});
