// Geometry for the broken-ring cycle dial. Kept out of CycleDial.tsx so that
// file only exports the component — React Fast Refresh needs component-only
// exports to hot-reload cleanly.

// Day 1 begins at 12 o'clock and the cycle sweeps clockwise from there. The
// broken-ring gap trails just counter-clockwise of the top, where the predicted
// next period sits — so the seam closes right before day 1 restarts at the top.
export const GAP_DEG = 32;
export const ARC_START_DEG = 0; // day 1 begins at the top
export const ARC_SWEEP_DEG = 360 - GAP_DEG; // arc the whole cycle spans

// Center angle (deg, clockwise from 12 o'clock) of a day's segment.
export function dayAngleDeg(index: number, totalDays: number) {
  return ARC_START_DEG + (ARC_SWEEP_DEG * (index + 0.5)) / totalDays;
}

export function pointerAngleDeg(
  x: number,
  y: number,
  rect: { left: number; top: number; width: number; height: number },
): number {
  const dx = x - (rect.left + rect.width / 2);
  const dy = y - (rect.top + rect.height / 2);
  // atan2(dx, -dy) puts 0deg at 12 o'clock, matching the conic gradient.
  return ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
}

export function dayIndexFromPoint(
  x: number,
  y: number,
  rect: { left: number; top: number; width: number; height: number },
  totalDays: number,
): number {
  const relative = pointerAngleDeg(x, y, rect) - ARC_START_DEG;
  const index = Math.floor((relative / ARC_SWEEP_DEG) * totalDays);
  return Math.min(Math.max(index, 0), totalDays - 1);
}
