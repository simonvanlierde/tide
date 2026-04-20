import type { CycleSummary, IsoDate } from "../../domain/types";
import { buildCycleSegments } from "./CycleView";

interface CircularCycleViewProps {
  summary: CycleSummary;
  periodDays: IsoDate[];
  today: IsoDate;
}

function getCircleStyle(segments: ReturnType<typeof buildCycleSegments>) {
  const segmentSize = 100 / segments.length;
  const stops = segments.map((segment, index) => {
    const start = index * segmentSize;
    const end = start + segmentSize;
    const color = segment.isPeriod
      ? "#cf705d"
      : segment.isOvulation
        ? "#d99a56"
        : segment.isFertile
          ? "#f0cc99"
          : "rgba(114, 92, 80, 0.14)";

    return `${color} ${start}% ${end}%`;
  });

  return {
    background: `conic-gradient(${stops.join(", ")})`,
  };
}

export function CircularCycleView({
  summary,
  periodDays,
  today,
}: CircularCycleViewProps) {
  const segments = buildCycleSegments(summary, periodDays, today);
  const currentIndex = segments.findIndex((segment) => segment.isCurrent);
  const rotation =
    currentIndex >= 0 ? ((currentIndex + 0.5) / segments.length) * 360 : 0;

  return (
    <section aria-label="Circular cycle view" className="cycle-circle">
      <div className="cycle-circle__legend">
        <span className="cycle-view__legend-item">
          <span
            className="cycle-view__dot cycle-view__dot--period"
            aria-hidden="true"
          />
          Period
        </span>
        <span className="cycle-view__legend-item">
          <span
            className="cycle-view__dot cycle-view__dot--fertile"
            aria-hidden="true"
          />
          Fertile window
        </span>
        <span className="cycle-view__legend-item">
          <span
            className="cycle-view__dot cycle-view__dot--ovulation"
            aria-hidden="true"
          />
          Ovulation
        </span>
      </div>

      <div className="cycle-circle__frame">
        <div className="cycle-circle__ring" style={getCircleStyle(segments)}>
          <div className="cycle-circle__inner">
            <span className="cycle-circle__label">Current position</span>
            <strong>Day {summary.cycleDay ?? "--"}</strong>
          </div>
        </div>
        <div
          role="img"
          className="cycle-circle__marker"
          aria-label={`Cycle day ${summary.cycleDay ?? "--"}, today`}
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        />
      </div>
    </section>
  );
}
