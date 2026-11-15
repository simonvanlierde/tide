import type { CycleSegment } from "./cycleSegments";
import { ARC_START_DEG, ARC_SWEEP_DEG } from "./dialGeometry";

// Conic-gradient builders for the dial's three layers (ring, estimate rails,
// day ticks). Pure functions of the segments, so they can be tested without a
// DOM.

// Day-boundary tick, drawn on its own masked layer near the outer rim (see
// .cycle-dial__ticks) so it reads as a little mark, not a line crossing the
// whole ring.
const TICK_DEG = 0.8;
const TICK_COLOR = "color-mix(in srgb, var(--ink) 16%, transparent)";
// The expected period is an estimate, drawn like the fertile window: an
// outline (see .cycle-dial__estimates) that dissolves toward the top seam.
const PREDICTED_FADE_DEG = 16; // how far the expected outline tapers toward the top
const PREDICTED_TAIL_STEP = 1.25; // tail length past the arc, in day-widths
// How many day-widths the expected-period nub occupies. A period runs longer
// than this, but the dial only hints at the next start — a fuller run would eat
// too much of the ring — so it shows a compact 1.5-day forecast, not periodLength.
export const PREDICTED_SPAN_DAYS = 1.5;
// Neighbouring phase colors blend over a couple degrees instead of hard-cutting.
const BLEND_DEG = 1.4;
// The seam fade: day 1 fades in from the top gap, and with no predicted period
// the last logged day fades out into it.
const FADE_DEG = 8;

// Estimated days fill the same band with a wash of their colour, so the ring
// stays one band; the rails from estimateColor mark them as estimates.
// The filled ring: logged days in their flow colour, the idle stretch, and a
// wash under each estimate.
export function phaseColor(segment: CycleSegment) {
  // isPeriod first: a day logged without a level still belongs to the period
  // arc, in base coral, rather than falling through to fertile or idle.
  if (segment.isPeriod) {
    return segment.flow ? `var(--flow-${segment.flow})` : "var(--bleed)";
  }
  return segment.isOvulation
    ? "var(--dial-wash-ovulation)"
    : segment.isFertile
      ? "var(--dial-wash-fertile)"
      : "var(--cycle-idle)";
}

export function estimateColor(segment: CycleSegment) {
  if (segment.isPeriod) {
    return "transparent";
  }
  return segment.isOvulation
    ? "var(--estimate-ovulation)"
    : segment.isFertile
      ? "var(--estimate-fertile)"
      : "transparent";
}

// The angular window over which the predicted period fades out toward the top.
// Shared by the expected outline and the day ticks so they dissolve together.
function predictedFade(total: number) {
  const step = ARC_SWEEP_DEG / total;
  const tailEnd = ARC_SWEEP_DEG + PREDICTED_TAIL_STEP * step;
  const fadeStart = Math.max(tailEnd - PREDICTED_FADE_DEG, step * (total - 1));
  return { fadeStart, tailEnd };
}

export function ringStyle(
  segments: CycleSegment[],
  predictedCount: number,
  color: (segment: CycleSegment) => string,
  predictedColor: string,
) {
  const total = segments.length + predictedCount;
  const step = ARC_SWEEP_DEG / total;
  const stops: string[] = [];
  segments.forEach((segment, i) => {
    const isLast = i === segments.length - 1;
    // Day 1 fades in from the gap; interior boundaries blend a touch.
    const start = i === 0 ? FADE_DEG : step * i + BLEND_DEG;
    let end = step * (i + 1) - BLEND_DEG;
    // The last logged day fades out into the gap only when no predicted period
    // follows to carry the ring onward.
    if (isLast && predictedCount === 0) {
      end = step * (i + 1) - FADE_DEG;
    }
    stops.push(`${color(segment)} ${start}deg ${end}deg`);
  });
  if (predictedCount > 0) {
    // The predicted days, tapering out toward the top.
    const { fadeStart, tailEnd } = predictedFade(total);
    const cellStart = step * segments.length + BLEND_DEG;
    stops.push(`${predictedColor} ${cellStart}deg ${Math.max(fadeStart, cellStart)}deg`);
    stops.push(`transparent ${tailEnd}deg 360deg`);
  } else {
    stops.push(`transparent ${ARC_SWEEP_DEG}deg 360deg`);
  }

  return {
    background: `conic-gradient(from ${ARC_START_DEG}deg, ${stops.join(", ")})`,
  };
}

// Little ticks at every day boundary, on a layer masked to a thin band at the
// outer rim. Through the predicted period they carry on up toward the top,
// fading out in step with the ghosted coral fill.
export function getTicksStyle(total: number, predictedCount: number) {
  const step = ARC_SWEEP_DEG / total;
  const fade = predictedCount > 0 ? predictedFade(total) : null;
  const lastBoundary = fade ? 360 : ARC_SWEEP_DEG + TICK_DEG;
  const stops = ["transparent 0deg"];
  for (let i = 1; step * i < lastBoundary; i += 1) {
    const boundary = step * i;
    const alpha =
      fade && boundary > fade.fadeStart ? Math.max(0, (fade.tailEnd - boundary) / (fade.tailEnd - fade.fadeStart)) : 1;
    if (alpha <= 0) {
      continue;
    }
    const color =
      alpha >= 1 ? TICK_COLOR : `color-mix(in srgb, ${TICK_COLOR} ${Math.round(alpha * 100)}%, transparent)`;
    stops.push(
      `transparent ${boundary - TICK_DEG / 2}deg`,
      `${color} ${boundary - TICK_DEG / 2}deg`,
      `${color} ${boundary + TICK_DEG / 2}deg`,
      `transparent ${boundary + TICK_DEG / 2}deg`,
    );
  }
  stops.push("transparent 360deg");
  return {
    background: `conic-gradient(from ${ARC_START_DEG}deg, ${stops.join(", ")})`,
  };
}
