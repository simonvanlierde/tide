import { addDays, differenceInDays } from "../../utils/date";
import type { CycleSummary, IsoDate } from "../../domain/types";
import { CycleLegend } from "./CycleLegend";

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

export function buildCycleSegments(
  summary: CycleSummary,
  periodDays: IsoDate[],
  today: IsoDate,
) {
  const totalDays =
    summary.nextPeriod.daysUntil !== null && summary.cycleDay !== null
      ? Math.max(
          summary.cycleDay + summary.nextPeriod.daysUntil,
          summary.cycleDay,
          28,
        )
      : 28;
  const cycleStartDate =
    summary.cycleDay !== null ? addDays(today, -(summary.cycleDay - 1)) : null;
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
      : new Set(
          periodDays.filter((day) => day >= cycleStartDate && day <= today),
        );

  return Array.from({ length: totalDays }, (_, index) => {
    const dayNumber = index + 1;
    const dateValue =
      cycleStartDate === null ? null : addDays(cycleStartDate, index);

    return {
      dayNumber,
      isCurrent: dayNumber === summary.cycleDay,
      isPeriod: dateValue !== null && loggedDays.has(dateValue),
      isFertile:
        fertileStart !== null &&
        ovulationDay !== null &&
        dayNumber >= fertileStart &&
        dayNumber <= ovulationDay + 1,
      isOvulation: ovulationDay === dayNumber,
    } satisfies CycleSegment;
  });
}

export function LinearCycleView({
  summary,
  periodDays,
  today,
}: CycleViewProps) {
  const segments = buildCycleSegments(summary, periodDays, today);

  return (
    <section aria-label="Linear cycle view" className="cycle-view">
      <CycleLegend className="cycle-view__legend" />

      <div className="cycle-view__track">
        {segments.map((segment) => {
          const className = [
            "cycle-view__segment",
            segment.isPeriod ? "is-period" : "",
            segment.isFertile ? "is-fertile" : "",
            segment.isOvulation ? "is-ovulation" : "",
            segment.isCurrent ? "is-current" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={segment.dayNumber}
              role="img"
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
