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

export function formatMonthInputValue(value: IsoDate): `${number}-${number}` {
  return value.slice(0, 7) as `${number}-${number}`;
}

export function parseMonthInputValue(value: string): IsoDate {
  return `${value}-01` as IsoDate;
}

export function differenceInDays(left: IsoDate, right: IsoDate): number {
  return Math.round(
    (parseIsoDate(left).getTime() - parseIsoDate(right).getTime()) / DAY_IN_MS,
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
