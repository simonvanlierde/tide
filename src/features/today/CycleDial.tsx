import type { CycleSummary, IsoDate } from "../../domain/types";
import { CycleLegend } from "./CycleLegend";
import { buildCycleSegments } from "./CycleView";

interface CycleDialProps {
  summary: CycleSummary;
  phaseLabel: string;
  periodDays: IsoDate[];
  today: IsoDate;
}

function getDialStyle(segments: ReturnType<typeof buildCycleSegments>) {
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

export function CycleDial({
  summary,
  phaseLabel,
  periodDays,
  today,
}: CycleDialProps) {
  const segments = buildCycleSegments(summary, periodDays, today);
  const currentIndex = segments.findIndex((segment) => segment.isCurrent);
  const rotation =
    currentIndex >= 0 ? ((currentIndex + 0.5) / segments.length) * 360 : 0;

  return (
    <section aria-label="Cycle overview" className="cycle-dial">
      <div className="cycle-dial__frame">
        <div className="cycle-dial__ring" style={getDialStyle(segments)}>
          <div className="cycle-dial__inner">
            <span className="cycle-dial__eyebrow">Cycle day</span>
            <strong className="cycle-dial__day">
              {summary.cycleDay ?? "--"}
            </strong>
            <span className="cycle-dial__phase">{phaseLabel}</span>
          </div>
        </div>
        <div
          className="cycle-dial__marker"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <span
            role="img"
            className="cycle-dial__marker-dot"
            aria-label={`Cycle day ${summary.cycleDay ?? "--"}, today`}
          />
        </div>
      </div>
      <CycleLegend className="cycle-dial__legend" />
    </section>
  );
}
