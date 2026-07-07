import { describe, expect, it } from "vitest";
import { dayIndexFromPoint } from "../../src/features/today/CycleDial";

describe("dayIndexFromPoint", () => {
  const rect = { left: 0, top: 0, width: 280, height: 280 };
  const totalDays = 28;

  // The ring is broken by a 24deg gap centred on 12 o'clock, so day 1 starts
  // 12deg clockwise of the top and the cycle spans the remaining 336deg.
  it("clamps the top gap to the nearest end day", () => {
    // Gap centre / dead top and its clockwise edge fall on day 1.
    expect(dayIndexFromPoint(140, 0, rect, totalDays)).toBe(0);
    expect(dayIndexFromPoint(141, 0, rect, totalDays)).toBe(0);
    // The counter-clockwise edge of the gap clamps to the last day.
    expect(dayIndexFromPoint(139, 0, rect, totalDays)).toBe(totalDays - 1);
  });

  it("maps quarter turns across the offset arc", () => {
    expect(dayIndexFromPoint(280, 140, rect, totalDays)).toBe(6); // 3 o'clock
    expect(dayIndexFromPoint(140, 280, rect, totalDays)).toBe(14); // 6 o'clock
    expect(dayIndexFromPoint(0, 140, rect, totalDays)).toBe(21); // 9 o'clock
  });
});
