import type { CycleSummary, IsoDate } from "../../domain/types";
import {
  addDays,
  differenceInDays,
  formatIsoDate,
  parseIsoDate,
} from "../../utils/date";

export type DayMarker = "fertile" | "ovulation" | "predicted-period";

const MONTH_LABEL_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const DAY_LABEL_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export interface CalendarDay {
  key: string;
  value: IsoDate;
  isOutsideMonth: boolean;
  isFuture: boolean;
  isToday: boolean;
}

export const HISTORY_WEEKDAY_LABELS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

export function formatMonthLabel(value: IsoDate) {
  return MONTH_LABEL_FORMAT.format(parseIsoDate(value));
}

export function formatDayButtonLabel(value: IsoDate, isLogged = false) {
  const verb = isLogged ? "Edit" : "Log";
  return `${verb} ${DAY_LABEL_FORMAT.format(parseIsoDate(value))}`;
}

export function buildMonthDays(
  visibleMonth: IsoDate,
  today: IsoDate,
): CalendarDay[] {
  const current = parseIsoDate(visibleMonth);
  const year = current.getUTCFullYear();
  const monthIndex = current.getUTCMonth();
  const firstWeekday =
    (new Date(Date.UTC(year, monthIndex, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const totalCells = firstWeekday + daysInMonth <= 35 ? 35 : 42;
  const gridStart = formatIsoDate(
    new Date(Date.UTC(year, monthIndex, 1 - firstWeekday)),
  );

  return Array.from({ length: totalCells }, (_, index) => {
    const value = addDays(gridStart, index);

    return {
      key: value,
      value,
      isOutsideMonth: parseIsoDate(value).getUTCMonth() !== monthIndex,
      isFuture: value > today,
      isToday: value === today,
    };
  });
}

// Paints a fertile window at `ovulationDate` — offsets `window.start..end`
// marked fertile, with the ovulation day itself set last so it wins its own
// cell. Bounded to the visible window so out-of-view cycles cost nothing.
function paintFertileWindow(
  markers: Map<IsoDate, DayMarker>,
  ovulationDate: IsoDate,
  window: { start: number; end: number },
  rangeStart: IsoDate,
  rangeEnd: IsoDate,
) {
  for (let offset = window.start; offset <= window.end; offset++) {
    const day = addDays(ovulationDate, offset);
    if (day >= rangeStart && day <= rangeEnd) {
      markers.set(day, "fertile");
    }
  }
  if (ovulationDate >= rangeStart && ovulationDate <= rangeEnd) {
    markers.set(ovulationDate, "ovulation");
  }
}

// Predicted markers for the visible grid window [rangeStart, rangeEnd]: the
// fertile window and ovulation for the next cycle plus every completed past
// cycle (`pastOvulationDates`, estimated retrospectively from each logged next
// period start), plus the expected period — a `periodLength`-day run repeating
// every `cycleLength` days from the next period onward, so the forecast
// continues indefinitely into the future. Later dates win, so ovulation
// overrides the fertile day it sits on. Fertility markers are omitted when the
// user has hidden them; logged days suppress markers at the grid layer.
export function buildCalendarMarkers(
  summary: CycleSummary,
  showFertility: boolean,
  rangeStart: IsoDate,
  rangeEnd: IsoDate,
  pastOvulationDates: IsoDate[] = [],
): Map<IsoDate, DayMarker> {
  const markers = new Map<IsoDate, DayMarker>();

  if (showFertility) {
    for (const ovulationDate of pastOvulationDates) {
      paintFertileWindow(
        markers,
        ovulationDate,
        summary.fertileWindow,
        rangeStart,
        rangeEnd,
      );
    }
    if (summary.ovulationDate) {
      paintFertileWindow(
        markers,
        summary.ovulationDate,
        summary.fertileWindow,
        rangeStart,
        rangeEnd,
      );
    }
  }

  if (summary.nextPeriod.date && summary.cycleLength > 0) {
    // Step forward one cycle at a time and paint each period run that overlaps
    // the window. Bounded by rangeEnd, so past months (start > rangeEnd) get
    // nothing and the loop stays cheap.
    for (
      let start = summary.nextPeriod.date;
      start <= rangeEnd;
      start = addDays(start, summary.cycleLength)
    ) {
      for (let offset = 0; offset < summary.periodLength; offset++) {
        const day = addDays(start, offset);
        if (day >= rangeStart && day <= rangeEnd) {
          markers.set(day, "predicted-period");
        }
      }
    }
  }

  return markers;
}

// Running cycle-day number for every day of the CURRENT cycle: 1 on the last
// period's start, counting up to — but not into — the next expected period,
// which is the next cycle's day 1. Bounded to the visible window. Empty when
// there's no period history to anchor day 1. Logged days are numbered
// separately (per-period) by getPeriodDayNumbers, so this fills the gaps.
export function buildCycleDayNumbers(
  summary: CycleSummary,
  today: IsoDate,
  rangeStart: IsoDate,
  rangeEnd: IsoDate,
): Map<IsoDate, number> {
  const numbers = new Map<IsoDate, number>();
  const nextPeriod = summary.nextPeriod.date;
  if (!nextPeriod || summary.cycleLength <= 0) {
    return numbers;
  }

  const cycleStart = addDays(nextPeriod, -summary.cycleLength);
  // Normally stop before the next expected period (the next cycle's day 1). But
  // when that prediction is already overdue, the current cycle is simply running
  // long — keep counting through today so it doesn't leave a blank stretch.
  const stopBefore = today >= nextPeriod ? addDays(today, 1) : nextPeriod;
  const from = cycleStart > rangeStart ? cycleStart : rangeStart;
  for (
    let day = from;
    day <= rangeEnd && day < stopBefore;
    day = addDays(day, 1)
  ) {
    numbers.set(day, differenceInDays(day, cycleStart) + 1);
  }

  return numbers;
}
