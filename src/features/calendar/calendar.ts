import type {
  DayEstimate,
  Forecast,
  IsoDate,
  LoggedFlow,
} from "../../domain/types";
import { addDays, formatIsoDate, parseIsoDate } from "../../utils/date";

export interface CalendarDay {
  key: string;
  value: IsoDate;
  isOutsideMonth: boolean;
  isFuture: boolean;
  isToday: boolean;
}

export function buildMonthDays(
  visibleMonth: IsoDate,
  today: IsoDate,
): CalendarDay[] {
  const current = parseIsoDate(visibleMonth);
  const year = current.getUTCFullYear();
  const monthIndex = current.getUTCMonth();
  // Weeks start on Monday (ISO 8601) for every locale, by design: one grid
  // shape everywhere, and getWeekdayLabels matches. Intentionally not
  // region-dependent.
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

export interface CalendarCell extends CalendarDay {
  isLogged: boolean;
  /** The logged flow; null when no level was chosen, or the day isn't logged. */
  flow: LoggedFlow;
  estimate: DayEstimate | null;
  cycleDay: number | null;
}

// What the grid shows on each day. A logged day shows its flow and nothing
// else. Any other day shows the forecast's estimate (fertility only when the
// user asked for it) and, once it has happened, its cycle-day number: the
// coral run already says which period day a logged cell is, and a number on a
// future cell would read as a fact.
export function buildCalendarCells(
  monthDays: CalendarDay[],
  forecast: Forecast,
  intensityByDay: Record<IsoDate, LoggedFlow>,
  showFertility: boolean,
  showCycleDayNumbers: boolean,
): CalendarCell[] {
  return monthDays.map((day) => {
    const isLogged = day.value in intensityByDay;
    const { cycleDay, estimate } = forecast.dayInfo(day.value);
    return {
      ...day,
      isLogged,
      flow: isLogged ? (intensityByDay[day.value] ?? null) : null,
      estimate:
        isLogged || (!showFertility && estimate !== "predicted-period")
          ? null
          : estimate,
      cycleDay:
        showCycleDayNumbers && !isLogged && !day.isFuture ? cycleDay : null,
    };
  });
}
