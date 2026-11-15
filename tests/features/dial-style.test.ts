import { describe, expect, it } from "vitest";
import type { CycleSegment } from "../../src/features/today/cycleSegments";
import { ARC_SWEEP_DEG } from "../../src/features/today/dialGeometry";
import { estimateColor, getTicksStyle, phaseColor, ringStyle } from "../../src/features/today/dialStyle";

function segment(overrides: Partial<CycleSegment> = {}): CycleSegment {
  return {
    dayNumber: 1,
    date: null,
    isCurrent: false,
    isPeriod: false,
    flow: null,
    isFertile: false,
    isOvulation: false,
    ...overrides,
  };
}

describe("phaseColor", () => {
  it("colours a period day by its flow, or base coral without a level", () => {
    expect(phaseColor(segment({ isPeriod: true, flow: "heavy" }))).toBe("var(--flow-heavy)");
    expect(phaseColor(segment({ isPeriod: true }))).toBe("var(--bleed)");
  });

  it("lets a period day win over a fertile estimate", () => {
    expect(phaseColor(segment({ isPeriod: true, isFertile: true }))).toBe("var(--bleed)");
  });

  it("washes ovulation, then the fertile window, and leaves the rest idle", () => {
    expect(phaseColor(segment({ isFertile: true, isOvulation: true }))).toBe("var(--dial-wash-ovulation)");
    expect(phaseColor(segment({ isFertile: true }))).toBe("var(--dial-wash-fertile)");
    expect(phaseColor(segment())).toBe("var(--cycle-idle)");
  });
});

describe("estimateColor", () => {
  it("outlines only estimates, never a logged period day", () => {
    expect(estimateColor(segment({ isPeriod: true, isFertile: true }))).toBe("transparent");
    expect(estimateColor(segment({ isFertile: true, isOvulation: true }))).toBe("var(--estimate-ovulation)");
    expect(estimateColor(segment({ isFertile: true }))).toBe("var(--estimate-fertile)");
    expect(estimateColor(segment())).toBe("transparent");
  });
});

describe("ringStyle", () => {
  const days = Array.from({ length: 4 }, (_, i) => segment({ dayNumber: i + 1 }));
  const gradient = (predictedCount: number) =>
    ringStyle(days, predictedCount, phaseColor, "var(--dial-wash-period)").background;

  it("fades day 1 in from the top gap and the last day out when nothing is expected", () => {
    const step = ARC_SWEEP_DEG / 4;
    expect(gradient(0)).toBe(
      `conic-gradient(from 0deg, var(--cycle-idle) 8deg ${step - 1.4}deg, ` +
        `var(--cycle-idle) ${step + 1.4}deg ${2 * step - 1.4}deg, ` +
        `var(--cycle-idle) ${2 * step + 1.4}deg ${3 * step - 1.4}deg, ` +
        `var(--cycle-idle) ${3 * step + 1.4}deg ${4 * step - 8}deg, transparent ${ARC_SWEEP_DEG}deg 360deg)`,
    );
  });

  it("carries the ring on into the expected period and tapers it out", () => {
    const style = gradient(1.5);
    expect(style).toContain("var(--dial-wash-period)");
    expect(style).toMatch(/transparent [\d.]+deg 360deg\)$/);
    // The taper reaches past the arc into the seam gap.
    const tailEnd = Number(/transparent ([\d.]+)deg 360deg/.exec(style)?.[1]);
    expect(tailEnd).toBeGreaterThan(ARC_SWEEP_DEG);
  });
});

describe("getTicksStyle", () => {
  // Each tick is a pair of coloured stops.
  const ticks = (style: string) =>
    (style.match(/color-mix\(in srgb, var\(--ink\) 16%, transparent\) /g) ?? []).length / 2;

  it("draws a tick at every day boundary up to the end of the arc", () => {
    const { background } = getTicksStyle(4, 0);
    expect(ticks(background)).toBe(4);
    expect(background.startsWith("conic-gradient(from 0deg, transparent 0deg")).toBe(true);
    expect(background.endsWith("transparent 360deg)")).toBe(true);
  });

  it("carries the ticks on through the expected period", () => {
    expect(ticks(getTicksStyle(5.5, 1.5).background)).toBe(6);
  });
});
