import type { IsoDate } from "../domain/types";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toDateParts(value: IsoDate) {
  const [year, month, day] = value.split("-").map(Number);
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
  return Math.round((parseIsoDate(left).getTime() - parseIsoDate(right).getTime()) / DAY_IN_MS);
}

export function getTodayIsoDate(): IsoDate {
  return formatIsoDate(new Date());
}
