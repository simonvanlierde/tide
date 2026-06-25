import type { CycleSummary, IsoDate } from "../../domain/types";
import { CycleLegend } from "./CycleLegend";
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
      ? "var(--cycle-period)"
      : segment.isOvulation
        ? "var(--cycle-ovulation)"
        : segment.isFertile
          ? "var(--cycle-fertile)"
          : "var(--cycle-idle)";

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
      <CycleLegend className="cycle-circle__legend" />

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
