import { DEFAULT_FLOW } from "../../domain/flow";
import type { CycleSummary, FlowIntensity, IsoDate } from "../../domain/types";
import { addDays, differenceInDays } from "../../utils/date";

export interface CycleSegment {
  dayNumber: number;
  date: IsoDate | null;
  isCurrent: boolean;
  isPeriod: boolean;
  /** Flow level for a period day, for the coral depth ramp; null otherwise. */
  flow: FlowIntensity | null;
  isFertile: boolean;
  isOvulation: boolean;
}

export function buildCycleSegments(
  summary: CycleSummary,
  periodDays: IsoDate[],
  today: IsoDate,
  showFertility: boolean,
  intensityByDay: Record<IsoDate, FlowIntensity> = {},
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
  const fertileStart =
    ovulationDay !== null ? ovulationDay + summary.fertileWindow.start : null;
  const fertileEnd =
    ovulationDay !== null ? ovulationDay + summary.fertileWindow.end : null;

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
    const isPeriod = dateValue !== null && loggedDays.has(dateValue);

    return {
      dayNumber,
      date: dateValue,
      isCurrent: dayNumber === summary.cycleDay,
      isPeriod,
      flow:
        isPeriod && dateValue !== null
          ? (intensityByDay[dateValue] ?? DEFAULT_FLOW)
          : null,
      isFertile:
        showFertility &&
        fertileStart !== null &&
        fertileEnd !== null &&
        dayNumber >= fertileStart &&
        dayNumber <= fertileEnd,
      isOvulation: showFertility && ovulationDay === dayNumber,
    } satisfies CycleSegment;
  });
}

export function getSegmentStatus(
  segment: CycleSegment,
  summary: CycleSummary,
): string {
  if (segment.isPeriod) {
    return "Period";
  }

  if (segment.isOvulation) {
    return "Ovulation expected";
  }

  if (segment.isFertile) {
    return "Fertile window";
  }

  if (
    segment.date !== null &&
    summary.nextPeriod.date !== null &&
    segment.date >= summary.nextPeriod.date
  ) {
    return "Period expected";
  }

  if (segment.date !== null && summary.ovulationDate !== null) {
    return differenceInDays(segment.date, summary.ovulationDate) > 0
      ? "Luteal"
      : "Follicular";
  }

  return "";
}
