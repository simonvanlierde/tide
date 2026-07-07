import { describe, expect, it } from "vitest";
import {
  ARC_START_DEG,
  ARC_SWEEP_DEG,
  dayAngleDeg,
  dayIndexFromPoint,
  GAP_DEG,
} from "../../src/features/today/dialGeometry";

describe("dayIndexFromPoint", () => {
  const rect = { left: 0, top: 0, width: 280, height: 280 };
  const totalDays = 28;
  const cx = 140;
  const cy = 140;
  const r = 120;

  // Pixel on the ring at a given angle, measured clockwise from 12 o'clock.
  function pointAt(angleDeg: number) {
    const a = (angleDeg * Math.PI) / 180;
    return { x: cx + Math.sin(a) * r, y: cy - Math.cos(a) * r };
  }

  // Derived from the geometry constants rather than hard-coded pixels, so these
  // stay correct as the gap size and start angle are tuned.
  it("maps each day's centre angle back to that day", () => {
    for (const index of [0, 7, 14, 21, totalDays - 1]) {
      const { x, y } = pointAt(dayAngleDeg(index, totalDays));
      expect(dayIndexFromPoint(x, y, rect, totalDays)).toBe(index);
    }
  });

  it("clamps the middle of the top gap to the last day", () => {
    const { x, y } = pointAt(ARC_START_DEG + ARC_SWEEP_DEG + GAP_DEG / 2);
    expect(dayIndexFromPoint(x, y, rect, totalDays)).toBe(totalDays - 1);
  });
});
