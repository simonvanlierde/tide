import type { CycleSummary, IsoDate } from "../../domain/types";
import { buildCycleSegments } from "./CycleView";

interface CircularCycleViewProps {
  summary: CycleSummary;
  periodDays: IsoDate[];
  today: IsoDate;
}

function getCircleStyle(segments: ReturnType<typeof buildCycleSegments>) {
  const size = segments.length;
  const stops = segments.map((segment, index) => {
    const start = (index / size) * 100;
    const end = ((index + 1) / size) * 100;
    let color = "rgba(114, 92, 80, 0.14)";

    if (segment.isPeriod) {
      color = "#cf705d";
    } else if (segment.isOvulation) {
      color = "#d99a56";
    } else if (segment.isFertile) {
      color = "#f0cc99";
    }

    return `${color} ${start}% ${end}%`;
  });

  return {
    background: `conic-gradient(${stops.join(", ")})`
  };
}

export function CircularCycleView({ summary, periodDays, today }: CircularCycleViewProps) {
  const segments = buildCycleSegments(summary, periodDays, today);
  const currentSegment = segments.find((segment) => segment.isCurrent) ?? segments[0];
  const rotation = ((currentSegment.dayNumber - 1) / segments.length) * 360;

  return (
    <section aria-label="Circular cycle view" className="cycle-circle">
      <div className="cycle-circle__legend">
        <span className="cycle-view__legend-item">
          <span className="cycle-view__dot cycle-view__dot--period" aria-hidden="true" />
          Period
        </span>
        <span className="cycle-view__legend-item">
          <span className="cycle-view__dot cycle-view__dot--fertile" aria-hidden="true" />
          Fertile window
        </span>
        <span className="cycle-view__legend-item">
          <span className="cycle-view__dot cycle-view__dot--ovulation" aria-hidden="true" />
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
          className="cycle-circle__marker"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
          aria-label={`Cycle day ${currentSegment.dayNumber}, today`}
        />
      </div>
    </section>
  );
}
