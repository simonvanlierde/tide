import { DEFAULT_CYCLE_LENGTH } from "../../domain/cycle";
import type {
  CycleSummary,
  Forecast,
  IsoDate,
  LoggedFlow,
} from "../../domain/types";
import type { MessageKey } from "../../i18n";
import { addDays, differenceInDays } from "../../utils/date";

export interface CycleSegment {
  dayNumber: number;
  date: IsoDate | null;
  isCurrent: boolean;
  isPeriod: boolean;
  /** Flow level for a period day, for the coral depth ramp; null otherwise. */
  flow: LoggedFlow;
  isFertile: boolean;
  isOvulation: boolean;
}

// One segment per day of the current cycle, read from the forecast. Without a
// live forecast the ring is a flat, dateless 28-day track.
export function buildCycleSegments(
  forecast: Forecast,
  intensityByDay: Record<IsoDate, LoggedFlow>,
  today: IsoDate,
): CycleSegment[] {
  const { cycleStart, cycleEnd } = forecast;
  if (cycleStart === null || cycleEnd === null) {
    return Array.from({ length: DEFAULT_CYCLE_LENGTH }, (_, index) => ({
      dayNumber: index + 1,
      date: null,
      isCurrent: false,
      isPeriod: false,
      flow: null,
      isFertile: false,
      isOvulation: false,
    }));
  }

  return Array.from(
    { length: differenceInDays(cycleEnd, cycleStart) + 1 },
    (_, index) => {
      const date = addDays(cycleStart, index);
      const { estimate } = forecast.dayInfo(date);
      // A logged future day (imported, or a clock that moved back) isn't a
      // fact yet, so the ring leaves it out.
      const isPeriod = date <= today && date in intensityByDay;
      return {
        dayNumber: index + 1,
        date,
        isCurrent: index + 1 === forecast.cycleDay,
        isPeriod,
        // null on a period day means "logged, level not chosen": the ring
        // shows it in base coral (see phaseColor, which keys off isPeriod).
        flow: isPeriod ? (intensityByDay[date] ?? null) : null,
        // The ovulation day is part of the fertile window too.
        isFertile: estimate === "fertile" || estimate === "ovulation",
        isOvulation: estimate === "ovulation",
      };
    },
  );
}

// Returns the message key for the segment's status (localized by the caller),
// or "" when there's nothing to show.
export function getSegmentStatus(
  segment: CycleSegment,
  summary: CycleSummary,
): MessageKey | "" {
  if (segment.isPeriod) {
    return "status.period";
  }

  if (segment.isOvulation) {
    return "status.ovulationExpected";
  }

  if (segment.isFertile) {
    return "status.fertileWindow";
  }

  if (
    segment.date !== null &&
    summary.nextPeriod.date !== null &&
    segment.date >= summary.nextPeriod.date
  ) {
    return "status.periodExpected";
  }

  // A dated day has a live forecast, so a missing ovulation date means
  // fertility estimates are off.
  if (segment.date !== null) {
    if (summary.ovulationDate === null) {
      return "phase.between";
    }
    return differenceInDays(segment.date, summary.ovulationDate) > 0
      ? "phase.luteal"
      : "phase.follicular";
  }

  return "";
}
