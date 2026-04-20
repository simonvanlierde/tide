import type { CycleSummary, IsoDate } from "./types";
import { addDays, differenceInDays } from "../utils/date";

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_LUTEAL_LENGTH = 14;

interface BuildCycleSummaryInput {
  today: IsoDate;
  periodDays: IsoDate[];
  completedCycleLengths: number[];
}

function sortDates(values: IsoDate[]) {
  return [...values].sort();
}

function getCycleStarts(periodDays: IsoDate[]) {
  const sortedDays = sortDates(periodDays);

  return sortedDays.filter((day, index) => {
    if (index === 0) {
      return true;
    }

    return differenceInDays(day, sortedDays[index - 1]) > 1;
  });
}

export function getCompletedCycleLengths(periodDays: IsoDate[]) {
  const cycleStarts = getCycleStarts(periodDays);

  if (cycleStarts.length < 2) {
    return [];
  }

  return cycleStarts
    .slice(1)
    .map((cycleStart, index) =>
      differenceInDays(cycleStart, cycleStarts[index]),
    );
}

function getPhaseLabel(
  today: IsoDate,
  periodDays: IsoDate[],
  ovulationDate: IsoDate,
  cycleDay: number,
) {
  if (periodDays.includes(today)) {
    return "menstrual" as const;
  }

  const ovulationOffset = differenceInDays(today, ovulationDate);

  if (Math.abs(ovulationOffset) <= 1) {
    return "ovulation" as const;
  }

  if (cycleDay > 0 && ovulationOffset > 1) {
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
    phaseLabel: getPhaseLabel(
      input.today,
      input.periodDays,
      ovulationDate,
      cycleDay,
    ),
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
