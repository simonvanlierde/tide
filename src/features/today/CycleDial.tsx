import { useRef, useState } from "react";
import type { CycleSummary, FlowIntensity, IsoDate } from "../../domain/types";
import { formatShortDate } from "../../utils/date";
import { CycleLegend } from "./CycleLegend";
import {
  buildCycleSegments,
  type CycleSegment,
  getSegmentStatus,
} from "./CycleView";
import {
  ARC_START_DEG,
  ARC_SWEEP_DEG,
  dayAngleDeg,
  dayIndexFromPoint,
  pointerAngleDeg,
} from "./dialGeometry";

interface CycleDialProps {
  summary: CycleSummary;
  phaseLabel: string;
  periodDays: IsoDate[];
  intensityByDay: Record<IsoDate, FlowIntensity>;
  today: IsoDate;
  showFertility: boolean;
}

// Day-boundary tick, drawn on its own masked layer near the outer rim (see
// .cycle-dial__ticks) so it reads as a little mark, not a line crossing the
// whole ring.
const TICK_DEG = 0.8;
const TICK_COLOR = "color-mix(in srgb, var(--ink) 16%, transparent)";
// The expected period is a ghosted coral fill — same hue as a logged period but
// translucent and soft-edged, so it reads as a forecast that dissolves toward
// the top seam.
const PREDICTED_COLOR =
  "color-mix(in srgb, var(--cycle-period) 60%, transparent)";
const PREDICTED_FADE_DEG = 16; // how far the ghosted fill tapers toward the top
const PREDICTED_TAIL_STEP = 1.25; // tail length past the arc, in day-widths
// Neighbouring phase colors blend over a couple degrees instead of hard-cutting.
const BLEND_DEG = 1.4;
// The seam fade: day 1 fades in from the top gap, and with no predicted period
// the last logged day fades out into it.
const FADE_DEG = 8;

function phaseColor(segment: CycleSegment) {
  return segment.flow
    ? `var(--flow-${segment.flow})`
    : segment.isOvulation
      ? "var(--cycle-ovulation)"
      : segment.isFertile
        ? "var(--cycle-fertile)"
        : "var(--cycle-idle)";
}

// The angular window over which the predicted period fades out toward the top.
// Shared by the coral fill and the day ticks so they dissolve together.
function predictedFade(total: number) {
  const step = ARC_SWEEP_DEG / total;
  const tailEnd = ARC_SWEEP_DEG + PREDICTED_TAIL_STEP * step;
  const fadeStart = Math.max(tailEnd - PREDICTED_FADE_DEG, step * (total - 1));
  return { fadeStart, tailEnd };
}

function getDialStyle(segments: CycleSegment[], predictedCount: number) {
  const total = segments.length + predictedCount;
  const step = ARC_SWEEP_DEG / total;
  const stops: string[] = [];
  segments.forEach((segment, i) => {
    const isLast = i === segments.length - 1;
    const color = phaseColor(segment);
    // Day 1 fades in from the gap; interior boundaries blend a touch.
    const start = i === 0 ? FADE_DEG : step * i + BLEND_DEG;
    let end = step * (i + 1) - BLEND_DEG;
    // The last logged day fades out into the gap only when no predicted period
    // follows to carry the ring onward.
    if (isLast && predictedCount === 0) {
      end = step * (i + 1) - FADE_DEG;
    }
    stops.push(`${color} ${start}deg ${end}deg`);
  });
  if (predictedCount > 0) {
    // Ghosted coral fill for the predicted days, tapering out toward the top.
    const { fadeStart, tailEnd } = predictedFade(total);
    const cellStart = step * segments.length + BLEND_DEG;
    stops.push(
      `${PREDICTED_COLOR} ${cellStart}deg ${Math.max(fadeStart, cellStart)}deg`,
    );
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
function getTicksStyle(total: number, predictedCount: number) {
  const step = ARC_SWEEP_DEG / total;
  const fade = predictedCount > 0 ? predictedFade(total) : null;
  const lastBoundary = fade ? 360 : ARC_SWEEP_DEG + TICK_DEG;
  const stops = ["transparent 0deg"];
  for (let i = 1; step * i < lastBoundary; i += 1) {
    const boundary = step * i;
    const alpha =
      fade && boundary > fade.fadeStart
        ? Math.max(
            0,
            (fade.tailEnd - boundary) / (fade.tailEnd - fade.fadeStart),
          )
        : 1;
    if (alpha <= 0) {
      continue;
    }
    const color =
      alpha >= 1
        ? TICK_COLOR
        : `color-mix(in srgb, ${TICK_COLOR} ${Math.round(alpha * 100)}%, transparent)`;
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

export function CycleDial({
  summary,
  phaseLabel,
  periodDays,
  intensityByDay,
  today,
  showFertility,
}: CycleDialProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  // The cycle day being previewed while scrubbing, or null for the live view.
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  // The exact pointer angle while scrubbing, so the ghost dot tracks the finger
  // rather than snapping to the day center. Null for keyboard previews.
  const [previewAngle, setPreviewAngle] = useState<number | null>(null);

  const segments = buildCycleSegments(
    summary,
    periodDays,
    today,
    showFertility,
    intensityByDay,
  );
  const currentIndex = segments.findIndex((segment) => segment.isCurrent);

  // The predicted period is one extra scrubbable cell past the logged cycle
  // (plus a decorative half-day tail drawn in the gradient). Modelled here, not
  // in the segment data, so it can be previewed like any other day.
  const nextDate = summary.nextPeriod.date;
  const predictedDate =
    nextDate !== null && segments[0]?.date ? nextDate : null;
  const cycleDayCount = segments.length;
  const predictedCount = predictedDate !== null ? 1 : 0;
  const totalCells = cycleDayCount + predictedCount;

  const rotation =
    currentIndex >= 0 ? dayAngleDeg(currentIndex, totalCells) : 0;

  // Ghost marker under the pointer: free-follows the finger while scrubbing,
  // otherwise sits on the previewed day (keyboard).
  const ghostAngle =
    previewIndex === null
      ? null
      : (previewAngle ?? dayAngleDeg(previewIndex, totalCells));

  const isPredictedPreview =
    previewIndex !== null && previewIndex >= cycleDayCount;
  const preview =
    previewIndex === null || isPredictedPreview ? null : segments[previewIndex];
  const centerDay = isPredictedPreview
    ? (previewIndex ?? 0) + 1
    : (preview?.dayNumber ?? summary.cycleDay ?? "--");
  const centerStatus = isPredictedPreview
    ? "Period expected"
    : preview
      ? getSegmentStatus(preview, summary) || phaseLabel
      : phaseLabel;
  const centerDate = isPredictedPreview
    ? predictedDate
    : preview
      ? preview.date
      : today;
  const valueText = isPredictedPreview
    ? `Day ${(previewIndex ?? 0) + 1}${predictedDate ? `, ${formatShortDate(predictedDate)}` : ""}, Period expected`
    : preview
      ? `Day ${preview.dayNumber}${preview.date ? `, ${formatShortDate(preview.date)}` : ""}, ${getSegmentStatus(preview, summary) || phaseLabel}`
      : `Day ${summary.cycleDay ?? "unknown"}, ${formatShortDate(today)}, ${phaseLabel}`;

  function updatePreview(event: React.PointerEvent<HTMLDivElement>) {
    const rect = frameRef.current?.getBoundingClientRect();
    if (rect) {
      const index = dayIndexFromPoint(
        event.clientX,
        event.clientY,
        rect,
        totalCells,
      );
      setPreviewIndex(index);
      // The ghost free-follows the finger everywhere. On day 1 (against the top
      // seam) it's floored to the cell centre so it can't perch on the seam —
      // but only on the left side: past the centre it free-follows again, so the
      // day 1↔2 border stays scrubbable.
      const angle = pointerAngleDeg(event.clientX, event.clientY, rect);
      const day1Centre = dayAngleDeg(0, totalCells);
      setPreviewAngle(index === 0 ? Math.max(angle, day1Centre) : angle);
    }
  }

  function clearPreview() {
    setPreviewIndex(null);
    setPreviewAngle(null);
  }

  function stepPreview(step: number) {
    setPreviewAngle(null);
    setPreviewIndex((index) => {
      const from =
        typeof index === "number"
          ? index
          : currentIndex >= 0
            ? currentIndex
            : 0;
      return Math.min(Math.max(from + step, 0), totalCells - 1);
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      stepPreview(1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      stepPreview(-1);
    } else if (event.key === "Escape") {
      clearPreview();
    }
  }

  return (
    <section aria-label="Cycle overview" className="cycle-dial">
      <div
        ref={frameRef}
        className="cycle-dial__frame"
        role="slider"
        aria-label="Cycle days"
        aria-valuemin={1}
        aria-valuemax={totalCells}
        aria-valuenow={
          isPredictedPreview
            ? (previewIndex ?? 0) + 1
            : (preview?.dayNumber ?? summary.cycleDay ?? 1)
        }
        aria-valuetext={valueText}
        tabIndex={0}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          updatePreview(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons > 0 || event.pointerType === "mouse") {
            updatePreview(event);
          }
        }}
        onPointerUp={clearPreview}
        onPointerLeave={clearPreview}
        onPointerCancel={clearPreview}
        onKeyDown={handleKeyDown}
        onBlur={clearPreview}
      >
        <div
          className="cycle-dial__ring"
          style={getDialStyle(segments, predictedCount)}
        >
          <div className="cycle-dial__inner">
            <span className="cycle-dial__eyebrow">Cycle day</span>
            <strong className="cycle-dial__day">{centerDay}</strong>
            <span className="cycle-dial__phase">{centerStatus}</span>
            {centerDate ? (
              <span className="cycle-dial__date">
                {formatShortDate(centerDate)}
              </span>
            ) : null}
          </div>
        </div>
        <div
          className="cycle-dial__ticks"
          style={getTicksStyle(totalCells, predictedCount)}
          aria-hidden="true"
        />
        <div
          className="cycle-dial__marker"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <span aria-hidden="true" className="cycle-dial__marker-dot" />
        </div>
        {ghostAngle !== null ? (
          <div
            className="cycle-dial__ghost"
            style={{ transform: `rotate(${ghostAngle}deg)` }}
            aria-hidden="true"
          >
            <span className="cycle-dial__ghost-dot" />
          </div>
        ) : null}
      </div>
      <CycleLegend
        className="cycle-dial__legend"
        showFertility={showFertility}
      />
    </section>
  );
}
