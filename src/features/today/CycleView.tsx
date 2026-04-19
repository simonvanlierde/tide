import { differenceInDays } from "../../utils/date";
import type { CycleSummary, IsoDate } from "../../domain/types";

export interface CycleSegment {
  dayNumber: number;
  isCurrent: boolean;
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
}

interface CycleViewProps {
  summary: CycleSummary;
  periodDays: IsoDate[];
  today: IsoDate;
}

export function getFertilityStatusLabel(summary: CycleSummary) {
  if (summary.phaseLabel === "ovulation") {
    return "Ovulation likely now";
  }

  if (summary.fertile) {
    return "Fertile window";
  }

  return "Lower chance of pregnancy";
}

export function buildCycleSegments(summary: CycleSummary, periodDays: IsoDate[], today: IsoDate) {
  const totalDays =
    summary.nextPeriod.daysUntil !== null && summary.cycleDay !== null
      ? Math.max(summary.cycleDay + summary.nextPeriod.daysUntil, summary.cycleDay, 28)
      : 28;
  const cycleStartDate =
    summary.cycleDay !== null
      ? new Date(Date.parse(`${today}T00:00:00Z`) - (summary.cycleDay - 1) * 24 * 60 * 60 * 1000)
      : null;
  const fertileStart =
    summary.cycleDay !== null && summary.ovulationDate
      ? summary.cycleDay + differenceInDays(summary.ovulationDate, today) - 5
      : null;
  const ovulationDay =
    summary.cycleDay !== null && summary.ovulationDate
      ? summary.cycleDay + differenceInDays(summary.ovulationDate, today)
      : null;

  const loggedDays =
    cycleStartDate === null
      ? new Set<string>()
      : new Set(periodDays.filter((day) => day >= cycleStartDate.toISOString().slice(0, 10) && day <= today));

  return Array.from({ length: totalDays }, (_, index) => {
    const dayNumber = index + 1;
    const dateValue =
      cycleStartDate === null
        ? null
        : new Date(cycleStartDate.getTime() + index * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    return {
      dayNumber,
      isCurrent: dayNumber === summary.cycleDay,
      isPeriod: dateValue !== null && loggedDays.has(dateValue),
      isFertile:
        fertileStart !== null &&
        ovulationDay !== null &&
        dayNumber >= fertileStart &&
        dayNumber <= ovulationDay + 1,
      isOvulation: ovulationDay === dayNumber
    } satisfies CycleSegment;
  });
}

export function LinearCycleView({ summary, periodDays, today }: CycleViewProps) {
  const segments = buildCycleSegments(summary, periodDays, today);

  return (
    <section aria-label="Linear cycle view" className="cycle-view">
      <div className="cycle-view__legend">
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

      <div className="cycle-view__track">
        {segments.map((segment) => {
          const className = [
            "cycle-view__segment",
            segment.isPeriod ? "is-period" : "",
            segment.isFertile ? "is-fertile" : "",
            segment.isOvulation ? "is-ovulation" : "",
            segment.isCurrent ? "is-current" : ""
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={segment.dayNumber}
              className={className}
              aria-label={`Cycle day ${segment.dayNumber}${segment.isCurrent ? ", today" : ""}`}
              title={`Cycle day ${segment.dayNumber}`}
            />
          );
        })}
      </div>

      <div className="cycle-view__labels">
        <span>Day 1</span>
        <span>Day {segments.length}</span>
      </div>
    </section>
  );
}
