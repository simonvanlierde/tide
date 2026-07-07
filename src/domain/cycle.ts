import { addDays, differenceInDays } from "../utils/date";
import type { CycleSummary, IsoDate } from "./types";

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_LUTEAL_LENGTH = 14;
// Expected-period run length, learned from past periods and clamped to ACOG's
// normal-menstruation band (2–7 days) so a single stray log can't stretch or
// shrink the prediction outside what's clinically typical. Default 4 (~median
// tracked bleed length) applies only before any period is logged.
const DEFAULT_PERIOD_LENGTH = 4;
const MIN_PERIOD_LENGTH = 2;
const MAX_PERIOD_LENGTH = 7;
// Gaps shorter than this are missed logging days within one period, not a new
// cycle: real inter-cycle gaps are ~20+ days (cycle length minus period length).
// NOTE: we use a fixed 10-day floor; a genuinely short (<~11-day) cycle would merge
// into one run.
// TODO: Learn a per-user threshold from cycle history if that matters.
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

// Average length of past periods, in days, clamped to [MIN, MAX]. The final
// run is dropped when there's more than one, since the most recent period may
// still be ongoing and would read as artificially short.
export function getAveragePeriodLength(periodDays: IsoDate[]): number {
  const sortedDays = [...periodDays].sort();
  const starts = getCycleStarts(sortedDays);
  if (starts.length === 0) {
    return DEFAULT_PERIOD_LENGTH;
  }

  const lengths = starts.map((start, index) => {
    const nextStart = starts[index + 1];
    const runDays = sortedDays.filter(
      (day) => day >= start && (nextStart === undefined || day < nextStart),
    );
    const lastDay = runDays.at(-1) ?? start;
    return differenceInDays(lastDay, start) + 1;
  });

  const completed = lengths.length > 1 ? lengths.slice(0, -1) : lengths;
  const average = Math.round(
    completed.reduce((sum, value) => sum + value, 0) / completed.length,
  );
  return Math.min(MAX_PERIOD_LENGTH, Math.max(MIN_PERIOD_LENGTH, average));
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
      cycleLength: DEFAULT_CYCLE_LENGTH,
      periodLength: DEFAULT_PERIOD_LENGTH,
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
    cycleLength,
    periodLength: getAveragePeriodLength(input.periodDays),
    estimateMode:
      input.completedCycleLengths.length > 0 ? "learned" : "fallback",
  };
}
