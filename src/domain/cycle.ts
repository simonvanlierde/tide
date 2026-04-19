import type { CycleSummary, IsoDate } from "./types";
import { addDays, differenceInDays } from "../utils/date";

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

function getPhaseLabel(today: IsoDate, periodDays: IsoDate[], ovulationDate: IsoDate, cycleDay: number) {
  if (periodDays.includes(today)) {
    return "period" as const;
  }

  const ovulationOffset = differenceInDays(today, ovulationDate);

  if (Math.abs(ovulationOffset) <= 1) {
    return "ovulatory" as const;
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
  if (input.completedCycleLengths.length === 0) {
    return {
      cycleDay: null,
      phaseLabel: "unknown",
      fertile: false,
      ovulationDate: null,
      nextPeriod: {
        date: null,
        daysUntil: null
      }
    };
  }

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
        daysUntil: null
      }
    };
  }

  const averageCycleLength = Math.round(
    input.completedCycleLengths.reduce((sum, value) => sum + value, 0) /
      input.completedCycleLengths.length
  );
  const cycleDay = differenceInDays(input.today, lastCycleStart) + 1;
  const nextPeriodDate = addDays(lastCycleStart, averageCycleLength);
  const ovulationDate = addDays(nextPeriodDate, -14);

  return {
    cycleDay,
    phaseLabel: getPhaseLabel(input.today, input.periodDays, ovulationDate, cycleDay),
    fertile: isWithinFertileWindow(input.today, ovulationDate),
    ovulationDate,
    nextPeriod: {
      date: nextPeriodDate,
      daysUntil: differenceInDays(nextPeriodDate, input.today)
    }
  };
}
