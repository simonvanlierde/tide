import { useRef, useState } from "react";
import type { CycleSummary, IsoDate } from "../../domain/types";
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
  today: IsoDate;
  showFertility: boolean;
}

function getDialStyle(segments: CycleSegment[]) {
  const segmentSize = 100 / segments.length;
  const stops = segments.map((segment, index) => {
    const start = index * segmentSize;
    const end = start + segmentSize;
    const color = segment.isPeriod
      ? "var(--cycle-period)"
      : segment.isOvulation
        ? "var(--cycle-ovulation)"
        : segment.isFertile
          ? "var(--cycle-fertile)"
          : "var(--cycle-idle)";

    return `${color} ${start}% ${end}%`;
  });

  return { background: `conic-gradient(from 0deg, ${stops.join(", ")})` };
}

export function dayIndexFromPoint(
  x: number,
  y: number,
  rect: { left: number; top: number; width: number; height: number },
  totalDays: number,
): number {
  const dx = x - (rect.left + rect.width / 2);
  const dy = y - (rect.top + rect.height / 2);
  // atan2(dx, -dy) puts 0deg at 12 o'clock, matching the conic gradient.
  const angle = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
  return Math.min(Math.floor((angle / 360) * totalDays), totalDays - 1);
}

// Distance of the angle-positioned labels from the dial center, as a fraction
// of the frame size (0.5 is the ring's outer edge).
const LABEL_RADIUS = 0.56;

function getLabelPosition(dayIndex: number, totalDays: number) {
  const angle = ((dayIndex + 0.5) / totalDays) * 2 * Math.PI;
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
  today,
  showFertility,
}: CycleDialProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  // A number previews that cycle day; "next" previews the predicted next
  // period, which sits one day past the last segment.
  const [previewIndex, setPreviewIndex] = useState<number | "next" | null>(
    null,
  );

  const segments = buildCycleSegments(
    summary,
    periodDays,
    today,
    showFertility,
  );
  const currentIndex = segments.findIndex((segment) => segment.isCurrent);
  const rotation =
    currentIndex >= 0 ? ((currentIndex + 0.5) / segments.length) * 360 : 0;

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
    }
  }

  function stepPreview(step: number) {
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
        setPreviewIndex(target);
      },
      onPointerMove: (event: React.PointerEvent) => {
        event.stopPropagation();
        if (event.buttons > 0 || event.pointerType === "mouse") {
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
      setPreviewIndex(null);
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
        onPointerUp={() => setPreviewIndex(null)}
        onPointerLeave={() => setPreviewIndex(null)}
        onPointerCancel={() => setPreviewIndex(null)}
        onKeyDown={handleKeyDown}
        onBlur={() => setPreviewIndex(null)}
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
