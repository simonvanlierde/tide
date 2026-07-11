import type { IsoDate } from "../domain/types";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toDateParts(value: IsoDate) {
  // IsoDate is validated as YYYY-MM-DD, so split always yields three numbers.
  const [year, month, day] = value.split("-").map(Number) as [
    number,
    number,
    number,
  ];
  return { year, month, day };
}

export function parseIsoDate(value: IsoDate): Date {
  const { year, month, day } = toDateParts(value);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatIsoDate(value: Date): IsoDate {
  return value.toISOString().slice(0, 10) as IsoDate;
}

export function addDays(value: IsoDate, amount: number): IsoDate {
  const date = parseIsoDate(value);
  date.setUTCDate(date.getUTCDate() + amount);
  return formatIsoDate(date);
}

export function addMonths(value: IsoDate, amount: number): IsoDate {
  const date = parseIsoDate(value);
  date.setUTCMonth(date.getUTCMonth() + amount, 1);
  return formatIsoDate(date);
}

export function differenceInDays(left: IsoDate, right: IsoDate): number {
  return Math.round(
    (parseIsoDate(left).getTime() - parseIsoDate(right).getTime()) / DAY_IN_MS,
  );
}

// Intl.DateTimeFormat construction isn't free, so cache one per locale+shape.
// Callers pass the resolved UI locale (see useLocale); it defaults to en-US so
// non-UI callers and unit tests keep the original English formatting.
const formatterCache = new Map<string, Intl.DateTimeFormat>();

// Named formatter shapes, so the cache key is a cheap `locale|shape` string and
// no per-call JSON.stringify is needed on the hot path (the calendar formats
// dozens of cells per render).
const FORMATTER_SHAPES = {
  short: { weekday: "short", month: "short", day: "numeric" },
  monthLabel: { month: "long", year: "numeric" },
  long: { month: "long", day: "numeric", year: "numeric" },
  monthName: { month: "long" },
  weekday: { weekday: "short" },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;

function dateFormatter(
  locale: string,
  shape: keyof typeof FORMATTER_SHAPES,
): Intl.DateTimeFormat {
  const key = `${locale}|${shape}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      timeZone: "UTC",
      ...FORMATTER_SHAPES[shape],
    });
    formatterCache.set(key, formatter);
  }
  return formatter;
}

export function formatShortDate(value: IsoDate, locale = "en-US"): string {
  return dateFormatter(locale, "short").format(parseIsoDate(value));
}

export function formatMonthLabel(value: IsoDate, locale = "en-US"): string {
  return dateFormatter(locale, "monthLabel").format(parseIsoDate(value));
}

// Full "Month D, YYYY" date used in the calendar's day-button labels.
export function formatLongDate(value: IsoDate, locale = "en-US"): string {
  return dateFormatter(locale, "long").format(parseIsoDate(value));
}

// Localized full month/weekday names for the calendar picker and grid header,
// generated from Intl so they translate for free. Weekdays start on Monday.
export function getMonthNames(locale = "en-US"): string[] {
  const format = dateFormatter(locale, "monthName").format;
  return Array.from({ length: 12 }, (_, month) =>
    format(new Date(Date.UTC(2021, month, 1))),
  );
}

export function getWeekdayLabels(locale = "en-US"): string[] {
  const format = dateFormatter(locale, "weekday").format;
  // 2024-01-01 is a Monday.
  return Array.from({ length: 7 }, (_, day) =>
    format(new Date(Date.UTC(2024, 0, 1 + day))),
  );
}

export function getTodayIsoDate(): IsoDate {
  // Local calendar parts, not toISOString (UTC), so "today" matches the user's
  // wall-clock day near midnight in non-UTC timezones.
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}` as IsoDate;
}
