import type { IsoDate } from "../../domain/types";
import { parseIsoDate } from "../../utils/date";

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
  return parseIsoDate(value).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatDayButtonLabel(value: IsoDate) {
  return `Toggle ${parseIsoDate(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })}`;
}

export function getMonthName(monthIndex: number) {
  return new Date(Date.UTC(2026, monthIndex, 1)).toLocaleDateString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
}

export function buildMonthDays(
  visibleMonth: IsoDate,
  today: IsoDate,
): CalendarDay[] {
  const current = parseIsoDate(visibleMonth);
  const year = current.getUTCFullYear();
  const monthIndex = current.getUTCMonth();
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const firstWeekday = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const totalCells = firstWeekday + daysInMonth <= 35 ? 35 : 42;
  const start = new Date(Date.UTC(year, monthIndex, 1 - firstWeekday));

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const value = date.toISOString().slice(0, 10) as IsoDate;

    return {
      key: value,
      value,
      isOutsideMonth: date.getUTCMonth() !== monthIndex,
      isFuture: value > today,
      isToday: value === today,
    };
  });
}

export function getHistoryYearOptions(
  today: IsoDate,
  _periodDays: IsoDate[],
) {
  const currentYear = parseIsoDate(today).getUTCFullYear();

  return Array.from(
    { length: currentYear - 2020 + 1 },
    (_, index) => 2020 + index,
  );
}
