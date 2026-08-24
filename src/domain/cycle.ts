import { addDays, differenceInDays } from "../utils/date";
import { REMINDER_OVERDUE_GRACE_DAYS } from "./reminders";
import type { CycleStats, CycleSummary, IsoDate } from "./types";

export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_LUTEAL_LENGTH = 14;
// Expected-period run length, learned from past periods and clamped to ACOG's
// normal-menstruation band (2–7 days) so a single stray log can't stretch or
// shrink the prediction outside what's clinically typical. Default 4 (~median
// tracked bleed length) applies only before any period is logged.
const DEFAULT_PERIOD_LENGTH = 4;
export const MIN_PERIOD_LENGTH = 2;
export const MAX_PERIOD_LENGTH = 7;
// Days without a logged (non-spotting) bleed after which the most recent period
// is treated as finished rather than possibly ongoing.
const MIN_DAYS_SINCE_BLEED = 5;
// Gaps shorter than this are missed logging days within one period, not a new
// cycle: real inter-cycle gaps are ~20+ days (cycle length minus period length).
// NOTE: we use a fixed 10-day floor; a genuinely short (<~11-day) cycle would merge
// into one run.
// TODO: Learn a per-user threshold from cycle history if that matters.
export const NEW_CYCLE_MIN_GAP_DAYS = 10;
// Cycle length is learned from recent history only — cycles drift over time
// (age, stress, meds), so a cycle from a year ago shouldn't count as much as
// last month's. Median over this window also resists a single anomalous cycle
// (illness, travel, a missed log) skewing the estimate the way a flat mean does.
export const RECENT_CYCLE_WINDOW = 6;
// Fertile window as day offsets from predicted ovulation. Biological base is
// −5..+1 (sperm survive ~5 days, egg ~1). We widen it by the spread of recent
// cycle lengths: ovulation timing is only as predictable as cycle length, so an
// irregular cycler gets a wider, honestly-hedged window and a regular one a
// tight one. Capped so a chaotic history can't smear fertility across the cycle.
export const FERTILE_WINDOW_START = -5;
export const FERTILE_WINDOW_END = 1;
const MAX_FERTILE_WIDENING = 5;

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

// Average length of past periods, in days, clamped to [MIN, MAX]. The most
// recent run is dropped only while it might still be bleeding — fewer than
// MIN_DAYS_SINCE_BLEED days since its last logged day — so a genuinely finished
// last period still counts. `periodDays` is expected spotting-filtered.
export function getAveragePeriodLength(
  periodDays: IsoDate[],
  today: IsoDate,
): number {
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

  const lastLoggedDay = sortedDays.at(-1);
  const lastRunOngoing =
    lastLoggedDay !== undefined &&
    differenceInDays(today, lastLoggedDay) < MIN_DAYS_SINCE_BLEED;
  const completed = lastRunOngoing ? lengths.slice(0, -1) : lengths;
  // The only period so far may still be bleeding: nothing learned yet.
  if (completed.length === 0) {
    return DEFAULT_PERIOD_LENGTH;
  }
  const average = Math.round(
    completed.reduce((sum, value) => sum + value, 0) / completed.length,
  );
  return Math.min(MAX_PERIOD_LENGTH, Math.max(MIN_PERIOD_LENGTH, average));
}

// Retrospective ovulation date for each *completed* cycle (one with a known
// following period start): ovulation sits ~14 luteal days before that next
// start. Anchoring on the logged next start makes this a better estimate than
// tiling the forward forecast backward, since luteal length is the stable part
// of the cycle. The last (in-progress) cycle has no next start yet, so it's
// left to the forward forecast.
export function getPastOvulationDates(periodDays: IsoDate[]): IsoDate[] {
  const starts = getCycleStarts(periodDays);
  const dates: IsoDate[] = [];
  for (let index = 1; index < starts.length; index++) {
    const nextStart = starts[index];
    if (nextStart) {
      dates.push(addDays(nextStart, -DEFAULT_LUTEAL_LENGTH));
    }
  }
  return dates;
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

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const upper = sorted[mid] ?? 0;
  if (sorted.length % 2 !== 0) {
    return upper;
  }
  return ((sorted[mid - 1] ?? upper) + upper) / 2;
}

function standardDeviation(values: number[]): number {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

// Median of the last RECENT_CYCLE_WINDOW cycles: recent (windowed) and robust
// (median) in one step. Falls back to the 28-day default with no history.
function estimateCycleLength(completedCycleLengths: number[]): number {
  const recent = completedCycleLengths.slice(-RECENT_CYCLE_WINDOW);
  return recent.length > 0 ? Math.round(median(recent)) : DEFAULT_CYCLE_LENGTH;
}

// Fertile-window offsets from ovulation, widened by recent cycle-length spread.
// Needs >= 2 recent cycles to have a spread at all; below that, the biological
// base window stands. We floor (not round) the SD: sub-day jitter (SD < 1) is a
// regular cycler and must keep the tight biological window — only a full day of
// spread earns a day of widening. Rounding would smear regular cycles wider.
function getFertileWindow(completedCycleLengths: number[]) {
  const recent = completedCycleLengths.slice(-RECENT_CYCLE_WINDOW);
  const spread =
    recent.length >= 2
      ? Math.min(MAX_FERTILE_WIDENING, Math.floor(standardDeviation(recent)))
      : 0;
  return {
    start: FERTILE_WINDOW_START - spread,
    end: FERTILE_WINDOW_END + spread,
  };
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

function isWithinFertileWindow(
  today: IsoDate,
  ovulationDate: IsoDate,
  window: { start: number; end: number },
) {
  const ovulationOffset = differenceInDays(today, ovulationDate);
  return ovulationOffset >= window.start && ovulationOffset <= window.end;
}

const INSUFFICIENT_SUMMARY: CycleSummary = {
  cycleDay: null,
  phaseLabel: "unknown",
  fertile: false,
  ovulationDate: null,
  nextPeriod: { date: null, daysUntil: null },
  cycleLength: DEFAULT_CYCLE_LENGTH,
  periodLength: DEFAULT_PERIOD_LENGTH,
  fertileWindow: { start: FERTILE_WINDOW_START, end: FERTILE_WINDOW_END },
  estimateMode: "insufficient",
};

export function buildCycleSummary(input: BuildCycleSummaryInput): CycleSummary {
  // A future-dated day (possible via import, or a clock that moved backwards)
  // would otherwise become the "last cycle start" and blow up every estimate.
  const periodDays = input.periodDays.filter((day) => day <= input.today);
  const cycleStarts = getCycleStarts(periodDays);
  const lastCycleStart = cycleStarts.at(-1);

  if (!lastCycleStart) {
    return INSUFFICIENT_SUMMARY;
  }

  const cycleLength = estimateCycleLength(input.completedCycleLengths);
  const fertileWindow = getFertileWindow(input.completedCycleLengths);
  const cycleDay = Math.max(
    1,
    differenceInDays(input.today, lastCycleStart) + 1,
  );
  const nextPeriodDate = addDays(lastCycleStart, cycleLength);
  const ovulationDate = addDays(nextPeriodDate, -DEFAULT_LUTEAL_LENGTH);
  const periodLength = getAveragePeriodLength(periodDays, input.today);

  // Long past the due date with nothing logged, the forecast is stale (the
  // user stopped tracking) — same bound the reminder uses to stop nagging.
  // The learned lengths are kept so the insights view still has history.
  if (
    differenceInDays(input.today, nextPeriodDate) > REMINDER_OVERDUE_GRACE_DAYS
  ) {
    return {
      ...INSUFFICIENT_SUMMARY,
      cycleLength,
      periodLength,
      fertileWindow,
    };
  }

  return {
    cycleDay,
    phaseLabel: getPhaseLabel(input.today, periodDays, ovulationDate),
    fertile: isWithinFertileWindow(input.today, ovulationDate, fertileWindow),
    ovulationDate,
    fertileWindow,
    nextPeriod: {
      date: nextPeriodDate,
      daysUntil: differenceInDays(nextPeriodDate, input.today),
    },
    cycleLength,
    periodLength,
    estimateMode:
      input.completedCycleLengths.length > 0 ? "learned" : "fallback",
  };
}

// Extra numbers behind the estimate, for the insights view. Cycle and period
// lengths already live on CycleSummary, so this only adds what the summary
// lacks: how many completed cycles it's learned from, and how much recent cycles
// vary (standard deviation, null until two cycles exist).
export function getCycleStats(periodDays: IsoDate[]): CycleStats {
  const completed = getCompletedCycleLengths(periodDays);
  const recent = completed.slice(-RECENT_CYCLE_WINDOW);
  return {
    cyclesTracked: completed.length,
    variabilityDays:
      recent.length >= 2
        ? Math.round(standardDeviation(recent) * 10) / 10
        : null,
  };
}
