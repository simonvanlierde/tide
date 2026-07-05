import { addDays, differenceInDays } from "../utils/date";
import type { CycleSummary, IsoDate } from "./types";

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_LUTEAL_LENGTH = 14;
// Gaps shorter than this are missed logging days within one period, not a new
// cycle: real inter-cycle gaps are ~20+ days (cycle length minus period length).
const NEW_CYCLE_MIN_GAP_DAYS = 10;

interface BuildCycleSummaryInput {
  today: IsoDate;
  periodDays: IsoDate[];
  completedCycleLengths: number[];
}

function getCycleStarts(periodDays: IsoDate[]) {
  const sortedDays = [...periodDays].sort();

  return sortedDays.filter((day, index) => {
    const previous = sortedDays[index - 1];
    return (
      previous === undefined ||
      differenceInDays(day, previous) >= NEW_CYCLE_MIN_GAP_DAYS
    );
  });
}

// Per logged day, its 1-based position within its period: calendar days since
// that period's start + 1, so skipped days still count (matching cycleDay). A
// gap >= NEW_CYCLE_MIN_GAP_DAYS opens a new period and resets the count.
export function getPeriodDayNumbers(
  periodDays: IsoDate[],
): Map<IsoDate, number> {
  const sortedDays = [...periodDays].sort();
  const numbers = new Map<IsoDate, number>();
  let start: IsoDate | undefined;

  for (let index = 0; index < sortedDays.length; index++) {
    const day = sortedDays[index];
    if (!day) continue;
    const previous = sortedDays[index - 1];

    if (
      start === undefined ||
      differenceInDays(day, previous ?? day) >= NEW_CYCLE_MIN_GAP_DAYS
    ) {
      start = day;
    }

    numbers.set(day, differenceInDays(day, start) + 1);
  }

  return numbers;
}

export function getCompletedCycleLengths(periodDays: IsoDate[]) {
  const cycleStarts = getCycleStarts(periodDays);
  const lengths: number[] = [];

  for (let index = 1; index < cycleStarts.length; index++) {
    const start = cycleStarts[index];
    const previousStart = cycleStarts[index - 1];

    if (start && previousStart) {
      lengths.push(differenceInDays(start, previousStart));
    }
  }

  return lengths;
}

function getPhaseLabel(
  today: IsoDate,
  periodDays: IsoDate[],
  ovulationDate: IsoDate,
) {
  if (periodDays.includes(today)) {
    return "menstrual" as const;
  }

  const ovulationOffset = differenceInDays(today, ovulationDate);

  if (Math.abs(ovulationOffset) <= 1) {
    return "ovulation" as const;
  }

  if (ovulationOffset > 1) {
    return "luteal" as const;
  }

  return "follicular" as const;
}

function isWithinFertileWindow(today: IsoDate, ovulationDate: IsoDate) {
  const ovulationOffset = differenceInDays(today, ovulationDate);
  return ovulationOffset >= -5 && ovulationOffset <= 1;
}

export function buildCycleSummary(input: BuildCycleSummaryInput): CycleSummary {
  const cycleStarts = getCycleStarts(input.periodDays);
  const lastCycleStart = cycleStarts.at(-1);

  if (!lastCycleStart) {
    return {
      cycleDay: null,
      phaseLabel: "unknown",
      fertile: false,
      ovulationDate: null,
      nextPeriod: {
        date: null,
        daysUntil: null,
      },
      estimateMode: "insufficient",
    };
  }

  const cycleLength =
    input.completedCycleLengths.length > 0
      ? Math.round(
          input.completedCycleLengths.reduce((sum, value) => sum + value, 0) /
            input.completedCycleLengths.length,
        )
      : DEFAULT_CYCLE_LENGTH;
  const cycleDay = Math.max(
    1,
    differenceInDays(input.today, lastCycleStart) + 1,
  );
  const nextPeriodDate = addDays(lastCycleStart, cycleLength);
  const ovulationDate = addDays(nextPeriodDate, -DEFAULT_LUTEAL_LENGTH);

  return {
    cycleDay,
    phaseLabel: getPhaseLabel(input.today, input.periodDays, ovulationDate),
    fertile: isWithinFertileWindow(input.today, ovulationDate),
    ovulationDate,
    nextPeriod: {
      date: nextPeriodDate,
      daysUntil: differenceInDays(nextPeriodDate, input.today),
    },
    estimateMode:
      input.completedCycleLengths.length > 0 ? "learned" : "fallback",
  };
}
