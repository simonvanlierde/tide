import type { IsoDate } from "../../domain/types";
import { addDays, formatIsoDate, parseIsoDate } from "../../utils/date";

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

export function formatDayButtonLabel(value: IsoDate) {
  return `Toggle ${DAY_LABEL_FORMAT.format(parseIsoDate(value))}`;
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
