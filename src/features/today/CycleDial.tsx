import { useRef, useState } from "react";
import type { CycleSummary, FlowIntensity, IsoDate } from "../../domain/types";
import { formatMonthDay, formatShortDate } from "../../utils/date";
import { CycleLegend } from "./CycleLegend";
import {
  buildCycleSegments,
  type CycleSegment,
  getSegmentStatus,
} from "./CycleView";

interface CycleDialProps {
  summary: CycleSummary;
  phaseLabel: string;
  periodDays: IsoDate[];
  intensityByDay: Record<IsoDate, FlowIntensity>;
  today: IsoDate;
  showFertility: boolean;
}

// The dial is a broken ring: a gap at 12 o'clock splits the previous period
// start (just clockwise of the gap) from the predicted next period (just
// counter-clockwise), so past and future no longer collide at the seam.
const GAP_DEG = 24;
const ARC_START_DEG = GAP_DEG / 2; // day 1 begins here, clockwise from top
const ARC_SWEEP_DEG = 360 - GAP_DEG; // arc the whole cycle spans

// Center angle (deg, clockwise from 12 o'clock) of a day's segment.
function dayAngleDeg(index: number, totalDays: number) {
  return ARC_START_DEG + (ARC_SWEEP_DEG * (index + 0.5)) / totalDays;
}

function getDialStyle(segments: CycleSegment[]) {
  const stops = segments.map((segment, index) => {
    const start = (ARC_SWEEP_DEG * index) / segments.length;
    const end = (ARC_SWEEP_DEG * (index + 1)) / segments.length;
    const color = segment.flow
      ? `var(--flow-${segment.flow})`
      : segment.isOvulation
        ? "var(--cycle-ovulation)"
        : segment.isFertile
          ? "var(--cycle-fertile)"
          : "var(--cycle-idle)";

    return `${color} ${start}deg ${end}deg`;
  });
  // The remaining arc stays transparent — the gap at the top of the ring.
  stops.push(`transparent ${ARC_SWEEP_DEG}deg 360deg`);

  return {
    background: `conic-gradient(from ${ARC_START_DEG}deg, ${stops.join(", ")})`,
  };
}

function pointerAngleDeg(
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

// Distance of the angle-positioned labels from the dial center, as a fraction
// of the frame size (0.5 is the ring's outer edge).
const LABEL_RADIUS = 0.56;

function getLabelPosition(dayIndex: number, totalDays: number) {
  const angle = (dayAngleDeg(dayIndex, totalDays) * Math.PI) / 180;
  const isRightHalf = Math.sin(angle) >= 0;

  return {
    left: `${50 + Math.sin(angle) * LABEL_RADIUS * 100}%`,
    top: `${50 - Math.cos(angle) * LABEL_RADIUS * 100}%`,
    transform: isRightHalf ? "translate(0, -50%)" : "translate(-100%, -50%)",
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
  // A number previews that cycle day; "next" previews the predicted next
  // period, which sits one day past the last segment.
  const [previewIndex, setPreviewIndex] = useState<number | "next" | null>(
    null,
  );
  // The exact pointer angle while scrubbing, so the ghost dot tracks the finger
  // rather than snapping to the day center. Null for keyboard/label previews.
  const [previewAngle, setPreviewAngle] = useState<number | null>(null);

  const segments = buildCycleSegments(
    summary,
    periodDays,
    today,
    showFertility,
    intensityByDay,
  );
  const currentIndex = segments.findIndex((segment) => segment.isCurrent);
  const rotation =
    currentIndex >= 0 ? dayAngleDeg(currentIndex, segments.length) : 0;

  // Ghost marker under the pointer: free-follows the finger while scrubbing,
  // otherwise sits on the previewed day (keyboard, label press).
  const ghostAngle =
    previewIndex === null
      ? null
      : previewAngle !== null
        ? previewAngle
        : previewIndex === "next"
          ? ARC_START_DEG + ARC_SWEEP_DEG
          : dayAngleDeg(previewIndex, segments.length);

  const preview =
    typeof previewIndex === "number" ? segments[previewIndex] : null;
  const isNextPeriodPreview = previewIndex === "next";
  const centerDay = isNextPeriodPreview
    ? 1
    : (preview?.dayNumber ?? summary.cycleDay ?? "--");
  const centerStatus = isNextPeriodPreview
    ? "Period expected"
    : preview
      ? getSegmentStatus(preview, summary) || phaseLabel
      : phaseLabel;
  const centerDate = isNextPeriodPreview
    ? summary.nextPeriod.date
    : preview
      ? preview.date
      : today;
  const valueText = isNextPeriodPreview
    ? `Next period expected${summary.nextPeriod.date ? `, ${formatShortDate(summary.nextPeriod.date)}` : ""}`
    : preview
      ? `Day ${preview.dayNumber}${preview.date ? `, ${formatShortDate(preview.date)}` : ""}, ${getSegmentStatus(preview, summary) || phaseLabel}`
      : `Day ${summary.cycleDay ?? "unknown"}, ${formatShortDate(today)}, ${phaseLabel}`;

  const cycleStartDate = segments[0]?.date ?? null;
  const fertileStartIndex = segments.findIndex((segment) => segment.isFertile);
  const ovulationIndex = segments.findIndex((segment) => segment.isOvulation);

  function updatePreview(event: React.PointerEvent<HTMLDivElement>) {
    const rect = frameRef.current?.getBoundingClientRect();
    if (rect) {
      setPreviewIndex(
        dayIndexFromPoint(event.clientX, event.clientY, rect, segments.length),
      );
      // Clamp the ghost to the track so it never floats into the top gap.
      const angle = pointerAngleDeg(event.clientX, event.clientY, rect);
      setPreviewAngle(
        Math.min(Math.max(angle, ARC_START_DEG), ARC_START_DEG + ARC_SWEEP_DEG),
      );
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
      return Math.min(Math.max(from + step, 0), segments.length - 1);
    });
  }

  // Press/hover on a key-date label previews exactly that day, instead of the
  // angle-derived one — on touch this is how the label meanings get seen.
  function labelPreviewProps(target: number | "next") {
    return {
      onPointerDown: (event: React.PointerEvent) => {
        event.stopPropagation();
        setPreviewAngle(null);
        setPreviewIndex(target);
      },
      onPointerMove: (event: React.PointerEvent) => {
        event.stopPropagation();
        if (event.buttons > 0 || event.pointerType === "mouse") {
          setPreviewAngle(null);
          setPreviewIndex(target);
        }
      },
    };
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
        aria-valuemax={segments.length}
        aria-valuenow={
          isNextPeriodPreview
            ? segments.length
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
        <div className="cycle-dial__ring" style={getDialStyle(segments)}>
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
        <div className="cycle-dial__labels">
          {cycleStartDate ? (
            <span
              className="cycle-dial__label cycle-dial__label--start"
              title="Previous period start"
              {...labelPreviewProps(0)}
            >
              <span
                className="cycle-view__dot cycle-view__dot--period"
                aria-hidden="true"
              />
              <span className="visually-hidden">Previous period start, </span>
              {formatMonthDay(cycleStartDate)}
            </span>
          ) : null}
          {summary.nextPeriod.date ? (
            <span
              className="cycle-dial__label cycle-dial__label--end"
              title="Next period expected"
              {...labelPreviewProps("next")}
            >
              <span
                className="cycle-view__dot cycle-view__dot--predicted"
                aria-hidden="true"
              />
              <span className="visually-hidden">Next period expected, </span>
              {formatMonthDay(summary.nextPeriod.date)}
            </span>
          ) : null}
          {fertileStartIndex >= 0 && segments[fertileStartIndex]?.date ? (
            <span
              className="cycle-dial__label"
              style={getLabelPosition(fertileStartIndex, segments.length)}
              title="Fertile window starts"
              {...labelPreviewProps(fertileStartIndex)}
            >
              <span
                className="cycle-view__dot cycle-view__dot--fertile"
                aria-hidden="true"
              />
              <span className="visually-hidden">Fertile window starts, </span>
              {formatMonthDay(segments[fertileStartIndex].date)}
            </span>
          ) : null}
          {ovulationIndex >= 0 && segments[ovulationIndex]?.date ? (
            <span
              className="cycle-dial__label"
              style={getLabelPosition(ovulationIndex, segments.length)}
              title="Ovulation expected"
              {...labelPreviewProps(ovulationIndex)}
            >
              <span
                className="cycle-view__dot cycle-view__dot--ovulation"
                aria-hidden="true"
              />
              <span className="visually-hidden">Ovulation expected, </span>
              {formatMonthDay(segments[ovulationIndex].date)}
            </span>
          ) : null}
        </div>
      </div>
      <CycleLegend
        className="cycle-dial__legend"
        showFertility={showFertility}
      />
    </section>
  );
}
