import type { IsoDate } from "../../domain/types";
import { parseIsoDate } from "../../utils/date";

export interface CalendarDay {
  key: string;
  value: IsoDate | null;
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

export function buildMonthDays(visibleMonth: IsoDate): CalendarDay[] {
  const current = parseIsoDate(visibleMonth);
  const year = current.getUTCFullYear();
  const monthIndex = current.getUTCMonth();
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const last = new Date(Date.UTC(year, monthIndex + 1, 0));
  const firstWeekday = (first.getUTCDay() + 6) % 7;
  const daysInMonth = last.getUTCDate();
  const days: CalendarDay[] = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    days.push({
      key: `blank-${year}-${monthIndex + 1}-${index + 1}`,
      value: null,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const value = new Date(Date.UTC(year, monthIndex, day))
      .toISOString()
      .slice(0, 10) as IsoDate;
    days.push({ key: value, value });
  }

  while (days.length % 7 !== 0) {
    days.push({
      key: `blank-${year}-${monthIndex + 1}-tail-${days.length + 1}`,
      value: null,
    });
  }

  return days;
}

export function getHistoryYearOptions(
  today: IsoDate,
  periodDays: IsoDate[],
) {
  return Array.from(
    new Set(
      [
        parseIsoDate(today).getUTCFullYear(),
        ...periodDays.map((day) => parseIsoDate(day).getUTCFullYear()),
      ].sort(),
    ),
  );
}
