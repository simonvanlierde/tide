import type { CycleSummary, IsoDate } from "../../domain/types";
import { addDays, differenceInDays } from "../../utils/date";

export interface CycleSegment {
  dayNumber: number;
  isCurrent: boolean;
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
}

export function buildCycleSegments(
  summary: CycleSummary,
  periodDays: IsoDate[],
  today: IsoDate,
) {
  const totalDays =
    summary.nextPeriod.daysUntil !== null && summary.cycleDay !== null
      ? Math.max(
          // cycleDay + daysUntil counts today twice (it is both the last day of
          // this cycle and day 0 of the countdown), so subtract 1.
          summary.cycleDay + summary.nextPeriod.daysUntil - 1,
          summary.cycleDay,
          28,
        )
      : 28;
  const cycleStartDate =
    summary.cycleDay !== null ? addDays(today, -(summary.cycleDay - 1)) : null;
  const ovulationDay =
    summary.cycleDay !== null && summary.ovulationDate
      ? summary.cycleDay + differenceInDays(summary.ovulationDate, today)
      : null;
  const fertileStart = ovulationDay !== null ? ovulationDay - 5 : null;

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
